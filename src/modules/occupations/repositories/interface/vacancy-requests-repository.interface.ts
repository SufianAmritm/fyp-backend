import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { VacancyRequest } from '../../entities/vacancy-requests.entity';

export const IVacancyRequestRepository = Symbol('IVacancyRequestRepository');

type DefaultEntity = VacancyRequest;
export interface IVacancyRequestRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<VacancyRequest>>;
}
