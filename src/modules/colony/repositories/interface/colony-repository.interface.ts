import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Colony } from '../../entities/colony.entity';
import { GetColonyDto } from '../../dto/request/get.dto';

export const IColonyRepository = Symbol('IColonyRepository');

type DefaultEntity = Colony;
export interface IColonyRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Colony>>;
}
