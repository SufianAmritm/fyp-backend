import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { Managers } from '../entities/managers.entity';
import { IManagersRepository } from './interface/managers-repository.interface';

@Injectable()
export class ManagersRepository
  extends BaseRepository<Managers>
  implements IManagersRepository
{
  constructor(
    @InjectRepository(Managers)
    public readonly repository: Repository<Managers>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Managers>> {
    const findOption = new FindOptionsBuilder<Managers>()
      .where({
        deletedAt: null })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}