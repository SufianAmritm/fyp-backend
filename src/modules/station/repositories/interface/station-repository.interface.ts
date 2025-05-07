import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Station } from '../../entities/station.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IStationRepository = Symbol(
  'IStationRepository',
);

type DefaultEntity = Station;
export interface IStationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
    findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Station>>;
}