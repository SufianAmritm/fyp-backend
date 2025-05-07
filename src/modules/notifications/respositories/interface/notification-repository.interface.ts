import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { UserNotification } from '../../entities/user-notifications.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IUserNotificationRepository = Symbol(
  'IUserNotificationRepository',
);

type DefaultEntity = UserNotification;
export interface IUserNotificationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<UserNotification>>;
}
