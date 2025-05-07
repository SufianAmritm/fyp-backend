import { NOTIFICATION_TYPE } from '../../../common/constants/enums';
import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { PagedList } from '../../../common/types/paged-list';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notifcation.dto';
import { UserNotification } from '../entities/user-notifications.entity';

export const IUserNotificationService = Symbol('IUserNotificationService');
export interface IUserNotificationService {
  create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<UserNotification>;
  createBulk(createNotificationDto: CreateNotificationDto[]): Promise<string>;

  findAll(
    paginationDto: PaginationDto,
    context: AppContext,
  ): Promise<PagedList<UserNotification>>;
  findOne(id: number): Promise<UserNotification>;
  update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<string>;
  // remove(id: number): Promise<string>;

  findAllWithType(type: NOTIFICATION_TYPE): Promise<UserNotification[]>;
}
