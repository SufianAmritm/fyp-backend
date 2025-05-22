import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fastcsv from 'fast-csv';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { PassThrough } from 'stream';
import { Repository } from 'typeorm';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
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
      .take(paginationDto.take)
      .skip((paginationDto.page - 1) * paginationDto.take)
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
      .take(paginationDto.take)
      .skip((paginationDto.page - 1) * paginationDto.take)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `station.${sortBy}`,
        orderBy,
      )
      .getManyAndCount();

    return new PagedList(stations[0], stations[1], take, page);
  }
  async downloadCsv(context: AppContext) {
    const res = await this.repository
      .createQueryBuilder('station')
      .innerJoinAndSelect('station.division', 'division')
      .orderBy('division.id', 'ASC')
      .stream();

    const csvStream = new PassThrough();
    const fastCsvStream = fastcsv.format({ headers: true });

    fastCsvStream.pipe(csvStream);

    res.on('data', async (row: any) => {
      res.pause();

      const [colonies, employees, apartments] = await Promise.all([
        this.repository.query(
          `SELECT COUNT(*) FROM public.colonies WHERE "station_id" = $1`,
          [row.station_id],
        ),
        this.repository.query(
          ` SELECT COUNT(e.*)
          FROM public.employees e
          INNER JOIN public.colonies c ON e.colony_id = c.id
          WHERE c.station_id = $1
          `,
          [row.station_id],
        ),
        this.repository.query(
          ` SELECT COUNT (a.*)
          FROM public.apartments a
          INNER JOIN public.colonies c ON a.colony_id = c.id
          WHERE c.station_id = $1
          `,
          [row.station_id],
        ),
      ]);

      const formattedRow = {
        Station: row.station_name,
        Division: row.division_name,
        Colonies: colonies[0].count,
        Employees: employees[0].count,
        Apartments: apartments[0].count,
      };
      if (!fastCsvStream.write(formattedRow)) {
        res.pause();
        fastCsvStream.once('drain', () => res.resume());
      } else {
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
