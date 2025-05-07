import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';

export interface IBaseService<T> {
  findAllWithoutOptions(
    paginationDto?: PaginationDto,
  ): Promise<PagedList<T> | T[]>;
  findOneById(id: number): Promise<T>;
  updateOneById<U>(
    id: number,
    data: U,
    modelIdentifier: new () => U,
    entityClass: new () => T,
  ): Promise<string>;
  deleteOneById(id: number): Promise<string>;
  createOne<U>(
    data: U,
    modelIdentifier: new () => U,
    entityClass: new () => T,
  ): Promise<T>;
}
