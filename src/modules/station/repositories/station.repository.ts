import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { Station } from '../entities/station.entity';
import { IStationRepository } from './interface/station-repository.interface';

@Injectable()
export class StationRepository
  extends BaseRepository<Station>
  implements IStationRepository
{
  constructor(
    @InjectRepository(Station)
    public readonly repository: Repository<Station>,
  ) {
    super(repository);
  }

  async findAll(paginationDto: PaginationDto): Promise<PagedList<Station>> {
    const findOption = new FindOptionsBuilder<Station>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
