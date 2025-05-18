import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { UserRoles } from '../../../common/constants/enums';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
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
    ctx: AppContext,
    transfer?: boolean,
  ): Promise<PagedList<Colony>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy, stationId } = getColonyDto;
    if (search) {
      whereOr.push(`colony.name ILIKE :search`);
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`division.name ILIKE :search`);
      whereOr.push(`colony.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (stationId) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = stationId;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    if (ctx.Role === UserRoles.EMPLOYEE && !transfer) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `colony.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }

  async findAllForTransfer(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Colony>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getColonyDto;
    if (search) {
      whereOr.push(`colony.name ILIKE :search`);
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`division.name ILIKE :search`);
      whereOr.push(`colony.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    const res = await this.repository
      .createQueryBuilder('colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `colony.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }
}
