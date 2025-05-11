import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { GetApartmentDto } from '../../dto/request/get.dto';
import { Apartment } from '../../entities/apartment.entity';

export const IApartmentRepository = Symbol('IApartmentRepository');

type DefaultEntity = Apartment;
export interface IApartmentRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Apartment>>;
}
