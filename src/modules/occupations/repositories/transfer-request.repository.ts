import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { TransferRequest } from '../entities/transfer-requests.entity';
import { ITransferRequestRepository } from './interface/transfer-request-repository.interface';

@Injectable()
export class TransferRequestRepository
  extends BaseRepository<TransferRequest>
  implements ITransferRequestRepository
{
  constructor(
    @InjectRepository(TransferRequest)
    public readonly repository: Repository<TransferRequest>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>> {
    const findOption = new FindOptionsBuilder<TransferRequest>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
