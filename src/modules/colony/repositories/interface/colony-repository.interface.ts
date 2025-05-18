import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { GetColonyDto } from '../../dto/request/get.dto';
import { Colony } from '../../entities/colony.entity';

export const IColonyRepository = Symbol('IColonyRepository');

type DefaultEntity = Colony;
export interface IColonyRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
    transfer?: boolean,
  ): Promise<PagedList<Colony>>;
  findAllForTransfer(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Colony>>;
}
