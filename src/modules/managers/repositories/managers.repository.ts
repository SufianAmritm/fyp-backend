import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { Manager } from '../entities/managers.entity';
import { IManagersRepository } from './interface/managers-repository.interface';

@Injectable()
export class ManagersRepository
  extends BaseRepository<Manager>
  implements IManagersRepository
{
  constructor(
    @InjectRepository(Manager)
    public readonly repository: Repository<Manager>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<Manager>> {
    const findOption = new FindOptionsBuilder<Manager>()
      .where({
        deletedAt: null,
      })
      .relations({
        user: true,
        station: true,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
