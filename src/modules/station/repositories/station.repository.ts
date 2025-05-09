import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Brackets, Repository } from 'typeorm';
import { GetStationDto } from '../dto/request/get.dto';
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

  async findAll(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Station>> {
    const { search } = getStationDto;
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;

    const builder = this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.division', 'division');

    if (search) {
      builder.where(
        new Brackets((qb) => {
          qb.where('division.name ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('station.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const stations = await builder
      .take(take)
      .skip(skip)
      .orderBy('station.id', 'DESC')
      .getManyAndCount();

    return new PagedList(stations[0], stations[1], take, page);
  }
}
