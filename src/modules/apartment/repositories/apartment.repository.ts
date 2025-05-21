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
      whereOr.push(`apartment.houseNo ILIKE :search`);
      whereOr.push(`apartment.streetNo ILIKE :search`);
      whereOr.push(`"apartment".rooms::text ILIKE :search`);
      whereOr.push(`"apartment".bathrooms::text ILIKE :search`);

      whereOr.push(`colony.name ILIKE :search`);
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`"occupation".status::text ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (
      context.Role === UserRoles.MANAGER ||
      context.Role === UserRoles.EMPLOYEE
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
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `apartment.${sortBy}`,
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
      .createQueryBuilder('apartment')
      .innerJoinAndSelect('apartment.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('apartment.occupation', 'occupation')
      .leftJoinAndSelect('occupation.occupiedBy', 'occupiedBy')
      .leftJoinAndSelect('occupiedBy.user', 'user')
      .orderBy('colony.id', 'ASC')
      .stream();

    const csvStream = new PassThrough();
    const fastCsvStream = fastcsv.format({ headers: true });

    fastCsvStream.pipe(csvStream);

    res.on('data', (row: any) => {
      console.log(row);
      const formattedRow = {
        ApartmentID: row.apartment_id || '',
        HouseNo: row.apartment_house_no || '',
        StreetNo: row.apartment_street_no || '',
        Rooms: row.apartment_rooms || '',
        Bathrooms: row.apartment_bathrooms || '',
        Address: row.apartment_address || '',
        Description: row.apartment_description || '',
        Colony: row.colony_name,
        Station: row.station_name,
        OccupationStatus: row.occupation_status || '',
        LastOccupiedOn: row.occupation_last_occupied_on?.toISOString() || '',
        LastVacantOn: row.occupation_last_vacant_on?.toISOString() || '',
        OccupiedBy: row.user_name || 'Unoccupied',
        OccupiedByEmail: row.user_email || '',
        OccupiedByPhone: row.user_phoneNumber || '',
        EmployeeID: row.occupiedBy_id || '',
      };
      if (!fastCsvStream.write(formattedRow)) {
        res.pause();
        fastCsvStream.once('drain', () => res.resume());
      }
    });

    res.on('end', () => fastCsvStream.end());
    res.on('error', (err) => {
      console.error('Data stream error:', err);
      fastCsvStream.destroy(err);
    });

    return csvStream;
  }
  async findAllForTransfer(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  ): Promise<PagedList<Apartment>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getApartmentDto;
    if (search) {
      whereOr.push(`apartment.houseNo ILIKE :search`);
      whereOr.push(`apartment.streetNo ILIKE :search`);
      whereOr.push(`colony.name ILIKE :search`);
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`"occupation".status::text ILIKE :search`);

      params.search = `%${search}%`;
    }
    const res = await this.repository
      .createQueryBuilder('apartment')
      .innerJoinAndSelect('apartment.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('apartment.occupation', 'occupation')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `apartment.${sortBy}`,
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
