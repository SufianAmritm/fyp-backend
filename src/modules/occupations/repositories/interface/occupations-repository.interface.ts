import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Occupation } from '../../entities/occupations.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IOccupationRepository = Symbol('IOccupationRepository');

type DefaultEntity = Occupation;
export interface IOccupationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Occupation>>;
}
