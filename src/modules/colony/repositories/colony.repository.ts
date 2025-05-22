import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fastcsv from 'fast-csv';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { PassThrough } from 'stream';
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
  async downloadCsv(context: AppContext) {
    const res = await this.repository
      .createQueryBuilder('colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .orderBy('division.id', 'ASC')
      .stream();

    const csvStream = new PassThrough();
    const fastCsvStream = fastcsv.format({ headers: true });

    fastCsvStream.pipe(csvStream);

    res.on('data', async (row: any) => {
      res.pause();

      const [apartments, employees] = await Promise.all([
        this.repository.query(
          `SELECT COUNT(*) FROM public.apartments WHERE "colony_id" = $1`,
          [row.colony_id],
        ),
        this.repository.query(
          `SELECT COUNT(*) FROM public.employees WHERE "colony_id" = $1`,
          [row.colony_id],
        ),
      ]);

      const formattedRow = {
        Colony: row.colony_name,
        Station: row.station_name,
        Division: row.division_name,
        Apartments: apartments[0].count,
        Employees: employees[0].count,
      };
      if (!fastCsvStream.write(formattedRow)) {
        res.pause();
        fastCsvStream.once('drain', () => res.resume());
      }else{
        res.resume();
      }
    });

    res.on('end', () => fastCsvStream.end());
    res.on('error', (err) => {
      console.error('Data stream error:', err);
      fastCsvStream.destroy(err);
    });

    return csvStream;
  }
}
