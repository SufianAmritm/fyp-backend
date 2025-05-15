import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { GetApplicationDto } from '../../dto/applications/get-applications.dto';
import { Application } from '../../entities/applications.entity';

export const IApplicationRepository = Symbol('IApplicationRepository');

type DefaultEntity = Application;
export interface IApplicationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getApplicationDto: GetApplicationDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Application>>;
}
