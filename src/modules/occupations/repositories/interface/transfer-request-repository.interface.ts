import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { GetTransferRequestDto } from '../../dto/get-transfer-requests.dto';
import { TransferRequest } from '../../entities/transfer-requests.entity';

export const ITransferRequestRepository = Symbol('ITransferRequestRepository');

type DefaultEntity = TransferRequest;
export interface ITransferRequestRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getDto: GetTransferRequestDto,

    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>>;
  countMyTransferRequests(context: AppContext): Promise<number>;
  countMyTransferRequestsNew(context: AppContext): Promise<number>;
}
