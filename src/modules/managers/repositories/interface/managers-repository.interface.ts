import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { Manager } from '../../entities/managers.entity';

export const IManagersRepository = Symbol('IManagersRepository');

type DefaultEntity = Manager;
export interface IManagersRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<Manager>>;
}
