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
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDivisionDto;
    if (search) {
      whereOr.push(`division.name ILIKE :search`);
      whereOr.push(`division.description ILIKE :search`);

      params.search = `%${search}%`;
    }
    const res = await this.repository
      .createQueryBuilder('division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `division.${sortBy}`,
        orderBy,
      )
      .take(paginationDto.take)
      .skip((paginationDto.page - 1) * paginationDto.take)
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
      .createQueryBuilder('division')
      .orderBy('division.id', 'ASC')
      .stream();

    const csvStream = new PassThrough();
    const fastCsvStream = fastcsv.format({ headers: true });

    fastCsvStream.pipe(csvStream);

    res.on('data', async (row: any) => {
      res.pause();

      const [stations, colonies, employees, apartments] = await Promise.all([
        this.repository.query(
          `SELECT COUNT(*) FROM public.stations WHERE "division_id" = $1`,
          [row.division_id],
        ),
        this.repository.query(
          ` SELECT COUNT(e.*)
          FROM public.colonies e
          INNER JOIN public.stations s ON e.station_id = s.id
          WHERE s.division_id = $1
          `,
          [row.division_id],
        ),
        this.repository.query(
          ` SELECT COUNT(e.*)
          FROM public.employees e
          INNER JOIN public.colonies c ON e.colony_id = c.id
INNER JOIN public.stations s ON s.id = c.station_id
          WHERE s.division_id = $1
          `,
          [row.division_id],
        ),
        this.repository.query(
          ` SELECT COUNT (a.*)
          FROM public.apartments a
          INNER JOIN public.colonies c ON a.colony_id = c.id
INNER JOIN public.stations s ON s.id = c.station_id
          WHERE c.division_id = $1
          `,
          [row.division_id],
        ),
      ]);

      const formattedRow = {
        Division: row.division_name,
        Colonies: colonies[0].count,
        Employees: employees[0].count,
        Apartments: apartments[0].count,
        Stations: stations[0].count,
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
