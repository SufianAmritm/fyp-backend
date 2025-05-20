import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PutObjectCommandInput } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { UtilsService } from '../../common/utils/UtilsService';
import { IS3Service } from '../aws/interface/aws-s3.interface';
import { IUserNotificationService } from '../notifications/interfaces/user-notification.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateManagersDto } from './dto/create-managers.dto';
import { GetManagersDto } from './dto/get-managers.dto';
import { UpdateManagersDto } from './dto/update-managers.dto';
import { Manager } from './entities/managers.entity';
import { IManagersService } from './interfaces/managers.interface';
import { IManagersRepository } from './repositories/interface/managers-repository.interface';
import { IEventsGateway } from '../events/interface/events.interface';

@Injectable()
export class ManagersService implements IManagersService {
  constructor(
    @Inject(IManagersRepository)
    private readonly managersRepository: IManagersRepository,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @Inject(IUserNotificationService)
    private readonly notificationService: IUserNotificationService,
    @Inject(IEventsGateway)
    private readonly eventGateway: IEventsGateway,
    @Inject(IS3Service)
    private readonly s3Service: IS3Service,
    private readonly utilService: UtilsService,
    @InjectMapper() private readonly managersMapper: Mapper,
  ) {}

  async findOneByUserId(userId: number): Promise<Manager> {
    const findOptions = new FindOptionsBuilder<Manager>()
      .where({ userId })
      .relations({
        user: true,
        station: {
          division: true,
        },
      })
      .build();
    const manager =
      await this.managersRepository.findOneWithBuilderOption(findOptions);
    if (manager?.user) manager.user.password = undefined;
    return manager;
  }

  async findOneByUserIdWithColoniesAndEmployees(userId: number) {
    const findOptions = new FindOptionsBuilder<Manager>()
      .where({ userId })
      .select({
        user: true,
        station: {
          id: true,
          colonies: {
            id: true,
            employees: {
              id: true,
            },
          },
        },
      })
      .relations({
        user: true,
        station: {
          colonies: {
            employees: true,
          },
        },
      })
      .build();
    const manager =
      await this.managersRepository.findOneWithBuilderOption(findOptions);
    if (manager?.user) manager.user.password = undefined;
    return manager;
  }

  async create(
    createManagersDto: CreateManagersDto,
    picture?: Express.Multer.File,
  ) {
    const { runner, user, transactionManager, emailData } =
      await this.userService.createManager(createManagersDto);
    try {
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
        createManagersDto.picture = this.utilService.awsPublicUrlBuilder(
          url.bucket,
          url.key,
        );
      }

      const newManager = this.managersMapper.map(
        createManagersDto,
        CreateManagersDto,
        Manager,
      );
      newManager.userId = user.id;
      const manager = await this.managersRepository.createWithTransaction(
        newManager,
        Manager,
        transactionManager,
      );
      await this.userService.sendEmailForNoPassword(
        user,
        emailData,
        transactionManager,
      );
      runner.end();
      user.password = undefined;
      return { ...user, manager };
    } catch (error) {
      console.error(error);
      if (runner) {
        await runner.rollbackTransaction();
      }

      if (error instanceof HttpException) throw error;
      throw new Error(error.message);
    }
  }

  async findAll(
    getDto: GetManagersDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ) {
    const managers = await this.managersRepository.findAll(
      getDto,
      paginationDto,
      ctx,
    );
    managers.items = managers.items.map((item) => {
      item.user.password = undefined;
      return item;
    });
    return managers;
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Manager>()
      .where({ id })
      .relations({
        user: true,
      })
      .build();
    const manager =
      await this.managersRepository.findOneWithBuilderOption(findOptions);
    if (manager?.user) manager.user.password = undefined;
    return manager;
  }

  async findOneByUserIdWithColonies(userId: number) {
    const findOptions = new FindOptionsBuilder<Manager>()
      .where({ userId })
      .select({
        user: true,
        station: {
          id: true,
          colonies: {
            id: true,
          },
        },
      })
      .relations({
        user: true,
        station: {
          colonies: true,
        },
      })
      .build();
    const manager =
      await this.managersRepository.findOneWithBuilderOption(findOptions);
    if (manager?.user) manager.user.password = undefined;
    return manager;
  }

  async update(
    id: number,
    updateManagersDto: UpdateManagersDto,
    picture: Express.Multer.File,
  ) {
    const manager = await this.managersRepository.findOne({ id });
    if (!manager) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Manager'));
    }
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
      updateManagersDto.picture = this.utilService.awsPublicUrlBuilder(
        url.bucket,
        url.key,
      );
    }

    await this.userService.update(manager.userId, updateManagersDto);

    const managersUpdate = this.managersMapper.map(
      updateManagersDto,
      CreateManagersDto,
      Manager,
    );
    await this.managersRepository.update({ id }, managersUpdate);
    const findOptions = new FindOptionsBuilder<Manager>()
      .where({ id })
      .relations({
        user: true,
      })
      .build();
    const man =
      await this.managersRepository.findOneWithBuilderOption(findOptions);
    await this.notificationService.create({
      userId: man.userId,
      title: 'Profile Updated',
      text: 'Your profile has been updated',
    });
    await this.eventGateway.sendEvent({
      to: manager.userId.toString(),
      pub: 'notification',
      data: {},
    });
    return man;
  }

  // async remove(id: number) {
  //   await this.managersRepository.softDelete({ id });
  //   return RESPONSE_MESSAGES.DELETED;
  // }
}
