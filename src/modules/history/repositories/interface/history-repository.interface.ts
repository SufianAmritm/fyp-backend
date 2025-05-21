import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { History } from '../../entities/history.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IHistoryRepository = Symbol(
  'IHistoryRepository',
);

type DefaultEntity = History;
export interface IHistoryRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
    findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<History>>;
}