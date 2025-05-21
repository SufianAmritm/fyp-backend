import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { PagedList } from '../../../common/types/paged-list';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { History } from '../entities/history.entity';

export const IHistoryService = Symbol('IHistoryService');
export interface IHistoryService {
  create(dto: CreateHistoryDto): Promise<History>;
  bulkCreate(dto: CreateHistoryDto[]): Promise<void>;

  findOneApartment(
    id: number,
    paginationDto: PaginationDto,
  ): Promise<PagedList<History>>;
  findOneEmployee(
    id: number,
    paginationDto: PaginationDto,
  ): Promise<PagedList<History>>;
}
