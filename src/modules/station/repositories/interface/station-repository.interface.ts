import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { GetStationDto } from '../../dto/request/get.dto';
import { Station } from '../../entities/station.entity';
import { PassThrough } from 'stream';
import { AppContext } from '../../../../common/interfaces/context';

export const IStationRepository = Symbol('IStationRepository');

type DefaultEntity = Station;
export interface IStationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Station>>;
  findAllForTransfer(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Station>>;
  downloadCsv(context: AppContext): Promise<PassThrough>;
}
