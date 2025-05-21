import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { History } from '../entities/history.entity';
import { IHistoryRepository } from './interface/history-repository.interface';

@Injectable()
export class HistoryRepository
  extends BaseRepository<History>
  implements IHistoryRepository
{
  constructor(
    @InjectRepository(History)
    public readonly repository: Repository<History>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<History>> {
    const findOption = new FindOptionsBuilder<History>()
      .where({
        deletedAt: null })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}