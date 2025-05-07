import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DOMAIN_ENTITY, RESPONSE_MESSAGES } from 'src/common/constants';

import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ConfigService } from '@nestjs/config';
import { APP_ERROR_MESSAGES } from 'src/common/constants/errors';
import {
  DbTransactionFactory,
  TransactionRunner,
} from 'src/common/database/utils/db-transaction-factory';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { IUserService } from './interfaces/user.interface';

import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  OTP_TYPE,
  UserRoles,
} from '../../common/constants/enums';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { IS3Service } from '../aws/interface/aws-s3.interface';
import { IEmailService } from '../email/interfaces/email.interface';
import { CreateManagersDto } from '../managers/dto/create-managers.dto';
import { IOtpService } from '../otp/interfaces/otp.interface';
import { IRoleService } from '../role/interfaces/role.interface';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/settings.entity';
import { User } from './entities/user.entity';
import { ISettingRepository } from './repositories/interfaces/settings-repository.interface';
import { IUserRepository } from './repositories/interfaces/user-repository.interface';
import { EmailData } from './types';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRoleService)
    private readonly roleService: IRoleService,
    @Inject(ISettingRepository)
    private readonly settingRepository: ISettingRepository,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    @Inject(IOtpService)
    private readonly otpService: IOtpService,
    @Inject(IS3Service)
    private readonly s3Service: IS3Service,
    private readonly dbTransactionFactory: DbTransactionFactory,
    private readonly configService: ConfigService,
    private readonly utilService: UtilsService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}
  async updateProfile(
    id: number,
    dto: UpdateUserDto,
    picture: Express.Multer.File,
  ): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ id })
      .relations({
        role: true,
      })
      .build();
    const user =
      await this.userRepository.findOneWithBuilderOption(findOptions);
    if (!user) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    }
    if (dto.password) dto.password = await this.utilService.hash(dto.password);
    if (picture) {
      const key = this.utilService.awsUploadKeyBuilder(
        picture.originalname,
        'profile',
      );
      const uploadOptions: PutObjectCommandInput = {
        Bucket: 'RESIDENCE_BUCKET',
        Body: picture.buffer,
        Key: key,
      };
      const url = await this.s3Service.uploadFile(uploadOptions);
      const publicUrl = this.utilService.awsPublicUrlBuilder(
        url.bucket,
        url.key,
      );
      if (user.role.name === UserRoles.MANAGER) {
        await this.userRepository.updateManagerPicture(id, publicUrl);
      }
    }
    await this.userRepository.update({ id }, dto);
    return this.getProfile(id);
  }

  async getSettings(userId: number): Promise<AppSetting> {
    return this.settingRepository.findOne({ userId });
  }

  async updateAppSettings(
    ctx: AppContext,
    dto: UpdateSettingsDto,
  ): Promise<string> {
    await this.settingRepository.update({ userId: ctx.UserId }, dto);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async createUser(
    signUpDto: SignUpDto | CreateAdminDto | CreateManagersDto,
    role: UserRoles,
  ) {
    let runner: TransactionRunner;
    try {
      const { email } = signUpDto;
      const userExist = await this.userRepository.findOne(
        { email },
        { id: true },
      );
      if (userExist)
        throw new Error(
          APP_ERROR_MESSAGES.ALREADY_EXISTS(
            DOMAIN_ENTITY.USER,
            `email: ${email}`,
          ),
        );
      const roles = await this.roleService.findAll();
      const adminRoleId = roles.find(
        (role) => role.name === UserRoles.ADMIN,
      ).id;
      const employeeRoleId = roles.find(
        (role) => role.name === UserRoles.EMPLOYEE,
      ).id;
      const managerRoleId = roles.find(
        (role) => role.name === UserRoles.MANAGER,
      ).id;
      runner = await this.dbTransactionFactory.transactionRunner();
      const transactionManager = runner.manager;

      await runner.start();
      const userMap = this.mapper.map(signUpDto, SignUpDto, User);
      if (signUpDto['password']) {
        userMap.password = await this.utilService.hash(
          (signUpDto as SignUpDto).password,
        );
      }
      if ([UserRoles.ADMIN, UserRoles.MANAGER].includes(role)) {
        userMap.roleId = role === UserRoles.ADMIN ? adminRoleId : managerRoleId;
        userMap.emailVerified = true;
      } else {
        userMap.roleId = employeeRoleId;
      }
      const user = await this.userRepository.createWithTransaction<User>(
        userMap,
        User,
        transactionManager,
      );
      user.password = undefined;
      // if (user.roleId === ROLES.ADMIN) {
      //   const newSettings: CreateSettingsDto = {

      //     userId: user.id,
      //     enableSuggestions: false,
      //   };

      //   const settingsRepository = transactionManager.getRepository(AppSetting);
      //   const settings = this.mapper.map(
      //     newSettings,
      //     CreateSettingsDto,
      //     AppSetting,
      //   );
      //   await this.settingRepository.createWithTransaction(
      //     settings,
      //     settingsRepository,
      //     transactionManager,
      //   );
      // }
      if (role !== UserRoles.MANAGER) {
        await runner.end();
      }
      const userWithTenant = await this.findOneById(user.id);
      const emailData: EmailData = {
        name: userWithTenant.name,
        email: userWithTenant.email,
        role: userWithTenant.role.name,
      };
      if (role === UserRoles.EMPLOYEE) {
        const otp = await this.otpService.create({
          userId: user.id,
          otp: Math.random().toString(36).substring(2, 8),
          type: OTP_TYPE.REGISTRATION,
          expireTimestamp: BigInt(Date.now() + 15 * 60 * 1000),
        });
        emailData.otp = otp.otp;
      }

      if (role !== UserRoles.MANAGER) {
        await this.emailService.send(
          email,
          EMAIL_SUBJECTS.REGISTER,
          EMAIL_TEMPLATES.REGISTER,
          emailData,
        );
      }
      if (role === UserRoles.MANAGER) {
        return { runner, user, transactionManager, emailData };
      }
      return user;
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      throw new Error(error.message);
    }
  }
  async sendPasswordResetEmail(user: User, otpType: OTP_TYPE) {
    const otp = await this.otpService.create({
      userId: user.id,
      otp: Math.random().toString(36).substring(2, 8),
      type: otpType,
      expireTimestamp: BigInt(Date.now() + 15 * 60 * 1000),
    });
    const emailData: EmailData = {
      name: user.name,
      email: user.email,
      role: user.role.name,
      otp: otp.otp,
    };
    await this.emailService.send(
      user.email,
      otpType === OTP_TYPE.REGISTRATION
        ? EMAIL_SUBJECTS.REGISTER
        : EMAIL_SUBJECTS.PASSWORD_RESET,
      otpType === OTP_TYPE.REGISTRATION
        ? EMAIL_TEMPLATES.REGISTER
        : EMAIL_TEMPLATES.PASSWORD_RESET,
      emailData,
    );
  }
  async sendManagerEmail(user: User, emailData: EmailData) {
    const otp = await this.otpService.create({
      userId: user.id,
      otp: Math.random().toString(36).substring(2, 8),
      type: OTP_TYPE.RESET_PASSWORD,
      expireTimestamp: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const encryptOtp = this.utilService.encrypt(otp.otp);
    emailData.frontendBaseUrl = `${this.configService.get('FRONTEND_PASSWORD_OTP_RESET_URL')}?otp=${encryptOtp}`;
    await this.emailService.send(
      user.email,
      EMAIL_SUBJECTS.REGISTER,
      EMAIL_TEMPLATES.REGISTER,
      emailData,
    );
  }

  async resetPassword(email: string, password: string): Promise<User> {
    const encryptedPassword = await this.utilService.hash(password);
    await this.userRepository.update(
      { email },
      {
        password: encryptedPassword,
      },
    );
    return this.findOneByEmail(email);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update({ id }, updateUserDto);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new Error(APP_ERROR_MESSAGES.ALREADY_IN_ACTIVE(DOMAIN_ENTITY.USER));
    }
    await this.userRepository.softDelete({ id });
    return RESPONSE_MESSAGES.IN_ACTIVATED;
  }

  async activate(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ id });
    if (user) {
      throw new Error(APP_ERROR_MESSAGES.ALREADY_ACTIVE(DOMAIN_ENTITY.USER));
    }
    await this.userRepository.restore({ id });
    return RESPONSE_MESSAGES.ACTIVATED;
  }

  async findOneByEmail(email: string): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ email })
      .relations({
        role: true,
      })
      .build();
    return this.userRepository.findOneWithBuilderOption(findOptions);
  }

  async findOneById(id: number): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ id })
      .relations({
        role: true,
      })
      .build();
    const user =
      await this.userRepository.findOneWithBuilderOption(findOptions);
    if (user) user.password = undefined;
    return user;
  }
  async getProfile(id: number): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ id })
      .relations({
        role: true,
        manager: true,
      })
      .build();
    const user =
      await this.userRepository.findOneWithBuilderOption(findOptions);
    if (user) user.password = undefined;
    return { ...user, ...user.manager };
  }

  // private async sendSignUpEmailVerification(
  //   tenantId: number,
  //   email: string,
  //   verificationUrl: string,
  //   emailTokenEncrypt: string,
  // ) {
  //   const expirationTimeInMinutes =
  //     this.utilsService.getEnvironmentVariable<number>(
  //       'EMAIL_VERIFICATION_EXPIRATION_MINUTES',
  //     );
  //   const data = {
  //     confirm_account_link: `${verificationUrl}?token=${emailTokenEncrypt}`,
  //     expirationTimeInMinutes,
  //   };
  //   await this.emailService.send(
  //     tenantId,
  //     email,
  //     EMAIL_CONSTANTS.ACCOUNT_REGISTRATION.TEMPLATE,
  //     data,
  //   );
  // }

  // private async sendResetPasswordEmail(
  //   tenantId: number,
  //   email: string,
  //   verificationUrl: string,
  //   emailTokenEncrypt: string,
  // ) {
  //   const expirationTimeInMinutes =
  //     this.utilsService.getEnvironmentVariable<number>(
  //       'EMAIL_VERIFICATION_EXPIRATION_MINUTES',
  //     );
  //   const data = {
  //     link: `${verificationUrl}?token=${emailTokenEncrypt}`,
  //     expirationTimeInMinutes,
  //   };
  //   this.emailService.send(
  //     tenantId,
  //     email,
  //     EMAIL_CONSTANTS.RESET_PASSWORD.TEMPLATE,
  //     data,
  //   );
  // }
}
