import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppLog } from '../../entities/app-log.entity';

export const IAppLogRepository = Symbol('IAppLogRepository');

type DefaultEntity = AppLog;
export interface IAppLogRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<AppLog>>;
}
