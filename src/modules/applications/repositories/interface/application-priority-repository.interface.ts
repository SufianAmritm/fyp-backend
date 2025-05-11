import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { ApplicationPriority } from '../../entities/application-colonies.entity';

export const IApplicationPriorityRepository = Symbol(
  'IApplicationPriorityRepository',
);

type DefaultEntity = ApplicationPriority;
export interface IApplicationPriorityRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<ApplicationPriority>>;
}
