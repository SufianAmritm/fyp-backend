import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { AppContext } from '../../../common/interfaces/context';
import { Occupation } from '../entities/occupations.entity';
import { IOccupationRepository } from './interface/occupations-repository.interface';

@Injectable()
export class OccupationRepository
  extends BaseRepository<Occupation>
  implements IOccupationRepository
{
  constructor(
    @InjectRepository(Occupation)
    public readonly repository: Repository<Occupation>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Occupation>> {
    const findOption = new FindOptionsBuilder<Occupation>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
