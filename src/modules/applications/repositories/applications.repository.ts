import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { Application } from '../entities/applications.entity';
import { IApplicationRepository } from './interface/applications-repository.interface';

@Injectable()
export class ApplicationRepository
  extends BaseRepository<Application>
  implements IApplicationRepository
{
  constructor(
    @InjectRepository(Application)
    public readonly repository: Repository<Application>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Application>> {
    const findOption = new FindOptionsBuilder<Application>()
      .where({
        deletedAt: null,
      })
      .relations({
        colonyPriorities: {
          colony: true,
        },
        employee: {
          colony: {
            station: true,
          },
          user: true,
        },
        approvedBy: true,
        rejectedBy: true,
        createdBy: true,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
