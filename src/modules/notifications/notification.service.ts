import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { NOTIFICATION_TYPE } from '../../common/constants/enums';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notifcation.dto';
import { UserNotification } from './entities/user-notifications.entity';
import { IUserNotificationService } from './interfaces/user-notification.interface';
import { IUserNotificationRepository } from './respositories/interface/notification-repository.interface';

@Injectable()
export class UserNotificationService implements IUserNotificationService {
  constructor(
    @Inject(IUserNotificationRepository)
    private readonly notificationRepository: IUserNotificationRepository,
    @InjectMapper() private readonly notificationMapper: Mapper,
  ) {}

  findOne(id: number): Promise<UserNotification> {
    return this.notificationRepository.findOne(
      { id },
      {},
      // {
      //   user: true,
      // },
    );
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<UserNotification> {
    const notification = this.notificationMapper.map(
      createNotificationDto,
      CreateNotificationDto,
      UserNotification,
    );
    return await this.notificationRepository.create(notification);
  }

  async createBulk(
    createNotificationDto: CreateNotificationDto[],
  ): Promise<string> {
    const notifications = this.notificationMapper.mapArray(
      createNotificationDto,
      CreateNotificationDto,
      UserNotification,
    );
    await this.notificationRepository.bulkCreate(notifications);
    return RESPONSE_MESSAGES.CREATED;
  }

  findAllWithType(type: NOTIFICATION_TYPE): Promise<UserNotification[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const findOptions = new FindOptionsBuilder()
      .where({
        type,
        createdAt: MoreThanOrEqual(currentDate),
      })
      .build();
    return this.notificationRepository.findManyWithBuilderOption(findOptions);
  }

  // async create(createNotificationDto: CreateNotificationDto) {
  //   const newNotification = this.notificationMapper.map(createNotificationDto, CreateNotificationDto, Notification);
  //   return this.notificationRepository.create(newNotification);
  // }

  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.notificationRepository.findAll(paginationDto, ctx);
  }

  // findOne(id: number) {
  //   return this.notificationRepository.findOne({ id });
  // }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notificationUpdate = this.notificationMapper.map(
      updateNotificationDto,
      CreateNotificationDto,
      UserNotification,
    );
    await this.notificationRepository.update({ id }, notificationUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  // async remove(id: number) {
  //   await this.notificationRepository.softDelete({ id });
  //   return RESPONSE_MESSAGES.DELETED;
  // }
}
