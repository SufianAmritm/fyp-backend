import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Division } from '../../entities/division.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IDivisionRepository = Symbol(
  'IDivisionRepository',
);

type DefaultEntity = Division;
export interface IDivisionRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
    findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Division>>;
}