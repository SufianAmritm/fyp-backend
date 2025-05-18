import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
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
    const { search, divisionId, sortBy, orderBy } = getStationDto;
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;

    const params: Record<string, any> = {};
    const whereOr = [];
    const whereAnd = [];
    if (search) {
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`division.name ILIKE :search`);
      whereOr.push(`station.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (divisionId) {
      whereAnd.push(`division.id = :divisionId`);
      params.divisionId = divisionId;
    }

    const stations = await this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.division', 'division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .take(take)
      .skip(skip)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `station.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();

    return new PagedList(stations[0], stations[1], take, page);
  }

  async findAllForTransfer(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Station>> {
    const { search, sortBy, orderBy } = getStationDto;
    const { page, take } = paginationDto;
    const skip = (page - 1) * take;
    const params: Record<string, any> = {};
    const whereOr = [];
    const whereAnd = [];
    if (search) {
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`division.name ILIKE :search`);
      whereOr.push(`station.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    const stations = await this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.division', 'division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .take(take)
      .skip(skip)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `station.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();

    return new PagedList(stations[0], stations[1], take, page);
  }
}
