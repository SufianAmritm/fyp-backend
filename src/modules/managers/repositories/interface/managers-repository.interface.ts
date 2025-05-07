import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Managers } from '../../entities/managers.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IManagersRepository = Symbol(
  'IManagersRepository',
);

type DefaultEntity = Managers;
export interface IManagersRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
    findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Managers>>;
}