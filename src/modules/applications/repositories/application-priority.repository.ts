import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { ApplicationPriority } from '../entities/application-colonies.entity';
import { IApplicationPriorityRepository } from './interface/application-priority-repository.interface';

@Injectable()
export class ApplicationPriorityRepository
  extends BaseRepository<ApplicationPriority>
  implements IApplicationPriorityRepository
{
  constructor(
    @InjectRepository(ApplicationPriority)
    public readonly repository: Repository<ApplicationPriority>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<ApplicationPriority>> {
    const findOption = new FindOptionsBuilder<ApplicationPriority>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
