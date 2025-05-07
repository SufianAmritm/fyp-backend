import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppLog } from '../entities/app-log.entity';
import { IAppLogRepository } from './interface/app-log-repository.interface';

@Injectable()
export class AppLogRepository
  extends BaseRepository<AppLog>
  implements IAppLogRepository
{
  constructor(
    @InjectRepository(AppLog)
    public readonly repository: Repository<AppLog>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<AppLog>> {
    const findOption = new FindOptionsBuilder<AppLog>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
