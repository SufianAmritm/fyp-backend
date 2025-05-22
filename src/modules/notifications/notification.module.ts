import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './entities/user-notifications.entity';
import { IUserNotificationService } from './interfaces/user-notification.interface';
import { UserNotificationMappingProfile } from './mapping/notification.mapping';
import { NotificationController } from './notification.controller';
import { UserNotificationService } from './notification.service';
import { IUserNotificationRepository } from './respositories/interface/notification-repository.interface';
import { UserNotificationRepository } from './respositories/notification.repository';

const notificationEntities = [UserNotification];
const notificationRepositoryProvider = [
  {
    provide: IUserNotificationRepository,
    useClass: UserNotificationRepository,
  },
];
const notificationServiceProvider = [
  {
    provide: IUserNotificationService,
    useClass: UserNotificationService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(notificationEntities)],
  controllers: [NotificationController],
  providers: [
    ...notificationServiceProvider,
    ...notificationRepositoryProvider,
    UserNotificationMappingProfile,
  ],
  exports: [...notificationServiceProvider, ...notificationRepositoryProvider],
})
export class NotificationModule {}
