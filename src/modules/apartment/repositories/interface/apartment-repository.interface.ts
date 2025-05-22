import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { GetApartmentDto } from '../../dto/request/get.dto';
import { Apartment } from '../../entities/apartment.entity';
import { PassThrough } from 'stream';

export const IApartmentRepository = Symbol('IApartmentRepository');

type DefaultEntity = Apartment;
export interface IApartmentRepository<T = DefaultEntity> extends IBaseRepository<T> {
  findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
    context: AppContext,
  ): Promise<PagedList<Apartment>>;
  findAllForTransfer(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Apartment>>;
  downloadCsv(context: AppContext): Promise<PassThrough>;
  countMyApartments(context: AppContext): Promise<number>;
}
