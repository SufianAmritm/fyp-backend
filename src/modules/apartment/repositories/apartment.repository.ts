import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { UserRoles } from '../../../common/constants/enums';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetApartmentDto } from '../dto/request/get.dto';
import { Apartment } from '../entities/apartment.entity';
import { IApartmentRepository } from './interface/apartment-repository.interface';

@Injectable()
export class ApartmentRepository
  extends BaseRepository<Apartment>
  implements IApartmentRepository
{
  constructor(
    @InjectRepository(Apartment)
    public readonly repository: Repository<Apartment>,
  ) {
    super(repository);
  }

  async findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
    context: AppContext,
  ): Promise<PagedList<Apartment>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy, colonyId, colonyIds, status } =
      getApartmentDto;
    if (search) {
      whereAnd.push(`apartment.houseNo ILIKE :search`);
      params.search = `%${search}%`;
    }
    if (
      context.Role === UserRoles.EMPLOYEE ||
      context.Role === UserRoles.MANAGER
    ) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = context.StationId;
    }
    if (colonyId) {
      whereAnd.push(`apartment.colonyId =:colonyId`);
      params.colonyId = colonyId;
    }
    if (colonyIds) {
      whereAnd.push(`apartment.colonyId IN (:...colonyIds)`);
      params.colonyIds = colonyIds;
    }
    if (status) {
      whereAnd.push(`occupation.status =:status`);
      params.status = status;
    }
    const res = await this.repository
      .createQueryBuilder('apartment')
      .innerJoinAndSelect('apartment.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('apartment.occupation', 'occupation')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(`apartment.${sortBy}`, orderBy)
      .getManyAndCount();
    console.log(res);
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }
}
