import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { PagedList } from '../../../common/types/paged-list';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { MarkSeenDto } from '../dto/mark-seen.dto';
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
  update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<string>;
  markSeen(seenDto: MarkSeenDto);
}
