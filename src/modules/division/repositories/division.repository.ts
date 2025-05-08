import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { GetDivisionsDto } from '../dto/request/get.dto';
import { Division } from '../entities/division.entity';
import { IDivisionRepository } from './interface/division-repository.interface';

@Injectable()
export class DivisionRepository
  extends BaseRepository<Division>
  implements IDivisionRepository
{
  constructor(
    @InjectRepository(Division)
    public readonly repository: Repository<Division>,
  ) {
    super(repository);
  }

  async findAll(
    getDivisionDto: GetDivisionsDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Division>> {
    const { search } = getDivisionDto;
    const whereOptions: FindOptionsWhere<Division> = {};
    search && (whereOptions.name = `%${ILike(search)}%`);
    const findOption = new FindOptionsBuilder<Division>()
      .where(whereOptions)
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
