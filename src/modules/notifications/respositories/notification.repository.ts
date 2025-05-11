import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NOTIFICATION_SEND_TYPE, ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { In, Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { UserNotification } from '../entities/user-notifications.entity';
import { IUserNotificationRepository } from './interface/notification-repository.interface';

@Injectable()
export class UserNotificationRepository
  extends BaseRepository<UserNotification>
  implements IUserNotificationRepository
{
  constructor(
    @InjectRepository(UserNotification)
    public readonly repository: Repository<UserNotification>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<UserNotification>> {
    const findOption = new FindOptionsBuilder<UserNotification>()
      .where({
        deletedAt: null,
        sendType: In([
          NOTIFICATION_SEND_TYPE.DASHBOARD,
          NOTIFICATION_SEND_TYPE.BOTH,
        ]),
        userId: ctx.UserId,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
