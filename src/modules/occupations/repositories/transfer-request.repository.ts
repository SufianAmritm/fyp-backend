import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { GetTransferRequestDto } from '../dto/get-transfer-requests.dto';
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
    getDto: GetTransferRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>> {
    const { search } = getDto;
    const whereOptions: FindOptionsWhere<TransferRequest> = {};
    const findOption = new FindOptionsBuilder<TransferRequest>()
      .where(whereOptions)
      .relations({
        fromColony: {
          station: true,
        },
        toColony: {
          station: true,
        },
        employee: {
          user: true,
        },
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
