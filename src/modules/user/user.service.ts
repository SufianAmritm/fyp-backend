import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DOMAIN_ENTITY, RESPONSE_MESSAGES } from 'src/common/constants';

import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { APP_ERROR_MESSAGES } from 'src/common/constants/errors';
import {
  DbTransactionFactory,
  TransactionRunner,
} from 'src/common/database/utils/db-transaction-factory';
import { EntityManager } from 'typeorm';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { IUserService } from './interfaces/user.interface';

import {
  EMAIL_SUBJECTS,
  EMAIL_TEMPLATES,
  EMPLOYEE_VERIFICATION_STATUS,
  OTP_TYPE,
  UserRoles,
} from '../../common/constants/enums';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { IS3Service } from '../aws/interface/aws-s3.interface';
import { IEmailService } from '../email/interfaces/email.interface';
import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';
import { Employee } from '../employee/entities/employee.entity';
import { NewEmployeeUserReturn } from '../employee/types';
import { CreateManagersDto } from '../managers/dto/create-managers.dto';
import { Otp } from '../otp/entities/otp.entity';
import { IOtpService } from '../otp/interfaces/otp.interface';
import { IRoleService } from '../role/interfaces/role.interface';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/settings.entity';
import { User } from './entities/user.entity';
import { ISettingRepository } from './repositories/interfaces/settings-repository.interface';
import { IUserRepository } from './repositories/interfaces/user-repository.interface';
import { EmailData, NewManagerUserReturn } from './types';

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
  async getAdmin(): Promise<User> {
    const adminRole = await this.roleService.findOneByName(UserRoles.ADMIN);
    return this.userRepository.findOne({
      roleId: adminRole.id,
    });
  }

  async createManager(
    createManagerDto: CreateManagersDto,
  ): Promise<NewManagerUserReturn> {
    let runner: TransactionRunner;
    try {
      const { email } = createManagerDto;
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
      const role = await this.roleService.findOneByName(UserRoles.MANAGER);
      runner = await this.dbTransactionFactory.transactionRunner();
      const transactionManager = runner.manager;

      await runner.start();
      console.log(createManagerDto);

      const userMap = this.mapper.map(
        createManagerDto,
        CreateManagersDto,
        User,
      );
      console.log(userMap);
      userMap.roleId = role.id;
      userMap.emailVerified = true;
      const user = await this.userRepository.createWithTransaction<User>(
        userMap,
        User,
        transactionManager,
      );
      user.password = undefined;
      const emailData: EmailData = {
        name: user.name,
        email: user.email,
        role: role.name,
      };

      return {
        runner,
        user: {
          ...user,
          role,
        },
        transactionManager,
        emailData,
      };
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

      throw new Error(error.message);
    }
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<NewEmployeeUserReturn> {
    console.log(createEmployeeDto, 'createEmployeeDto');
    let runner: TransactionRunner;
    try {
      const { email } = createEmployeeDto;
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
      const role = await this.roleService.findOneByName(UserRoles.EMPLOYEE);
      runner = await this.dbTransactionFactory.transactionRunner();
      const transactionManager = runner.manager;

      await runner.start();
      const userMap = this.mapper.map(
        createEmployeeDto,
        CreateEmployeeDto,
        User,
      );
      console.log(userMap, 'userMap');
      userMap.roleId = role.id;
      const user = await this.userRepository.createWithTransaction<User>(
        userMap,
        User,
        transactionManager,
      );
      user.password = undefined;
      const emailData: EmailData = {
        name: user.name,
        email: user.email,
        role: role.name,
      };

      return {
        runner,
        user: {
          ...user,
          role,
        },
        transactionManager,
        emailData,
      };
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        APP_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    let runner: TransactionRunner;
    try {
      const { email } = createAdminDto;
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
      const role = await this.roleService.findOneByName(UserRoles.ADMIN);
      runner = await this.dbTransactionFactory.transactionRunner();
      const transactionManager = runner.manager;

      await runner.start();
      const userMap = this.mapper.map(createAdminDto, CreateAdminDto, User);
      userMap.password = await this.utilService.hash(createAdminDto.password);
      userMap.roleId = role.id;
      userMap.emailVerified = true;
      const user = await this.userRepository.createWithTransaction<User>(
        userMap,
        User,
        transactionManager,
      );
      user.password = undefined;
      const emailData: EmailData = {
        name: user.name,
        email: user.email,
        role: role.name,
      };

      await this.emailService.send(
        email,
        EMAIL_SUBJECTS.REGISTER,
        EMAIL_TEMPLATES.REGISTER,
        emailData,
      );
      await runner.end();
      const findUser = await this.findOneById(user.id);
      findUser.password = undefined;
      return findUser;
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

      throw new Error(error.message);
    }
  }

  async updateProfile(
    id: number,
    dto: UpdateUserDto,
    cnicFront?: Express.Multer.File,
    cnicBack?: Express.Multer.File,
    serviceCard?: Express.Multer.File,
    picture?: Express.Multer.File,
  ): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ id })
      .relations({
        role: true,
        employee: {
          verification: true,
        },
      })
      .build();

    const user =
      await this.userRepository.findOneWithBuilderOption(findOptions);
    if (!user) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    }
    if (dto.password) dto.password = await this.utilService.hash(dto.password);
    const uploadOperations = [];

    if (picture) {
      uploadOperations.push(this.uploadPic(picture, 'profile', 'picture'));
    }
    if (cnicFront) {
      uploadOperations.push(this.uploadPic(cnicFront, 'cnic', 'cnicFront'));
    }
    if (cnicBack) {
      uploadOperations.push(this.uploadPic(cnicBack, 'cnic', 'cnicBack'));
    }
    if (serviceCard) {
      uploadOperations.push(
        this.uploadPic(serviceCard, 'serviceCard', 'serviceCard'),
      );
    }

    const uploadResults = await Promise.all(uploadOperations);

    uploadResults.forEach(({ field, url }) => {
      dto[field] = url;
    });

    if (user.role.name === UserRoles.MANAGER) {
      await this.userRepository.updateManagerFromUser(id, dto);
    }
    if (user.role.name === UserRoles.EMPLOYEE) {
      if (
        !user.employee.verification.some(
          (verification) =>
            verification.status === EMPLOYEE_VERIFICATION_STATUS.APPROVED,
        )
      ) {
        Object.keys(dto).forEach((key) => {
          if (
            !['password', 'picture', 'members', 'name', 'address'].includes(key)
          )
            dto[key] = undefined;
        });
      }
      await this.userRepository.updateEmployeeFromUser(id, dto);
      await this.isEmployeeProfileComplete(id);
    }
    await this.userRepository.update({ id }, dto);

    return this.findOneById(id);
  }

  async isEmployeeProfileComplete(id: number): Promise<boolean> {
    const isComplete = await this.userRepository.isEmployeeProfileComplete(id);
    if (isComplete)
      await this.userRepository.updateEmployeeFromUser(id, {
        profileComplete: true,
      });
    return isComplete;
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

  async createUser(signUpDto: SignUpDto) {
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
      const role = await this.roleService.findOneByName(UserRoles.EMPLOYEE);
      runner = await this.dbTransactionFactory.transactionRunner();
      const transactionManager = runner.manager;

      await runner.start();
      const userMap = this.mapper.map(signUpDto, SignUpDto, User);
      userMap.password = await this.utilService.hash(signUpDto.password);
      userMap.roleId = role.id;
      const user = await this.userRepository.createWithTransaction<User>(
        userMap,
        User,
        transactionManager,
      );
      user.password = undefined;
      const employee =
        await this.userRepository.createWithTransaction<Employee>(
          {
            userId: user.id,
          },
          Employee,
          transactionManager,
        );
      const emailData: EmailData = {
        name: user.name,
        email: user.email,
        role: role.name,
      };
      const otpData = {
        userId: user.id,
        otp: Math.random().toString(36).substring(2, 8),
        type: OTP_TYPE.REGISTRATION,
        expireTimestamp: BigInt(Date.now() + 15 * 60 * 1000),
      };
      const otp = await this.userRepository.createWithTransaction<Otp>(
        otpData,
        Otp,
        transactionManager,
      );
      emailData.otp = otp.otp;

      await this.emailService.send(
        email,
        EMAIL_SUBJECTS.REGISTER,
        EMAIL_TEMPLATES.REGISTER,
        emailData,
      );
      await runner.end();
      user.role = role;
      user.employee = employee;
      return this.getProfile(user.id);
    } catch (error) {
      console.log(error);
      if (runner) {
        await runner.rollbackTransaction();
      }
      if (error instanceof HttpException) throw error;

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

  async sendEmailForNoPassword(
    user: User,
    emailData: EmailData,
    manager: EntityManager,
  ) {
    const otp = await this.userRepository.createWithTransaction<Otp>(
      {
        userId: user.id,
        otp: Math.random().toString(36).substring(2, 8),
        type: OTP_TYPE.RESET_PASSWORD,
        expireTimestamp: BigInt(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      Otp,
      manager,
    );
    emailData.frontendBaseUrl = `${this.configService.get('FRONTEND_PASSWORD_OTP_RESET_URL')}?otp=${otp.otp}`;
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
        manager: true,
        employee: {
          colony: {
            station: true,
          },
        },
      })
      .build();
    return this.userRepository.findOneWithBuilderOption(findOptions);
  }

  async findOneById(id: number): Promise<User> {
    const findOptions = new FindOptionsBuilder<User>()
      .where({ id })
      .relations({
        role: true,
        manager: true,
        employee: {
          colony: {
            station: true,
          },
        },
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
        manager: {
          station: true,
        },
        employee: {
          colony: {
            station: true,
          },
          occupations: true,
          verification: true,
        },
      })
      .build();
    const user =
      await this.userRepository.findOneWithBuilderOption(findOptions);
    if (user) user.password = undefined;
    if (user?.employee?.verification?.length > 0)
      user.employee.verification = user.employee.verification.filter(
        (verification) =>
          verification.status !== EMPLOYEE_VERIFICATION_STATUS.CANCELLED,
      );
    return user;
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
  private async uploadPic(
    file: Express.Multer.File,
    folder: string,
    field: string,
  ) {
    console.log('file', file);
    const key = this.utilService.awsUploadKeyBuilder(file.originalname, folder);
    const uploadOptions: PutObjectCommandInput = {
      Bucket: 'RESIDENCE_BUCKET',
      Body: file.buffer,
      Key: key,
    };
    const url = await this.s3Service.uploadFile(uploadOptions);
    return {
      url: this.utilService.awsPublicUrlBuilder(url.bucket, url.key),
      field,
    };
  }
}
