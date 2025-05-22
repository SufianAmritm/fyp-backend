import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { In, LessThanOrEqual } from 'typeorm';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkSeenDto } from './dto/mark-seen.dto';
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

  async findAll(paginationDto: PaginationDto, ctx: AppContext) {
    const unreadCount = await this.notificationRepository.count({
      userId: ctx.UserId,
      seen: false,
    });
    const resp = await this.notificationRepository.findAll(paginationDto, ctx);
    return { ...resp, unreadCount };
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notificationUpdate = this.notificationMapper.map(
      updateNotificationDto,
      CreateNotificationDto,
      UserNotification,
    );
    await this.notificationRepository.update({ id }, notificationUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async markSeen(seenDto: MarkSeenDto) {
    const { withDate, notificationIds, userId } = seenDto;
    if (withDate) {
      return this.notificationRepository.update(
        {
          userId,
          createdAt: LessThanOrEqual(withDate),
        },
        {
          seen: true,
        },
      );
    }
    if (notificationIds?.length > 0) {
      return this.notificationRepository.update(
        {
          id: In(notificationIds),
          userId,
        },
        {
          seen: true,
        },
      );
    }
  }
}
