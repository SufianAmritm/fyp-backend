import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { GetColonyDto } from '../dto/request/get.dto';
import { Colony } from '../entities/colony.entity';
import { IColonyRepository } from './interface/colony-repository.interface';

@Injectable()
export class ColonyRepository
  extends BaseRepository<Colony>
  implements IColonyRepository
{
  constructor(
    @InjectRepository(Colony)
    public readonly repository: Repository<Colony>,
  ) {
    super(repository);
  }

  async findAll(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Colony>> {
    const { search } = getColonyDto;
    const whereOptions: FindOptionsWhere<Colony> = {};
    search && (whereOptions.name = `%${ILike(search)}%`);
    const findOption = new FindOptionsBuilder<Colony>()
      .where(whereOptions)
      .relations({
        station: true,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
