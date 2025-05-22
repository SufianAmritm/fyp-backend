import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fastcsv from 'fast-csv';
import { UserRoles } from 'src/common/constants/enums';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { PassThrough } from 'stream';
import { Repository } from 'typeorm';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetEmployeeDto } from '../dto/get-employee-dto';
import { Employee } from '../entities/employee.entity';
import { IEmployeeRepository } from './interface/employee-repository.interface';
@Injectable()
export class EmployeeRepository
  extends BaseRepository<Employee>
  implements IEmployeeRepository
{
  constructor(
    @InjectRepository(Employee)
    public readonly repository: Repository<Employee>,
  ) {
    super(repository);
  }
  countMyNewEmployees(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('employee')
      .innerJoin('employee.colony', 'colony')
      .where(
        'colony.stationId = :stationId AND employee.createdAt >= :morethen',
        {
          stationId: context.StationId,
          morethen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      )
      .getCount();
  }
  countMyEmployees(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('employee')
      .innerJoin('employee.colony', 'colony')
      .where('colony.stationId = :stationId', { stationId: context.StationId })
      .getCount();
  }

  async findAll(
    getEmployeeDto: GetEmployeeDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Employee>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy, stationId } = getEmployeeDto;
    if (search) {
      whereOr.push(`user.name ILIKE :search`);
      whereOr.push(`user.email ILIKE :search`);
      whereOr.push(`user.phoneNumber ILIKE :search`);
      !(ctx.Role === UserRoles.MANAGER) &&
        whereOr.push(`station.name ILIKE :search`);
      !(ctx.Role === UserRoles.MANAGER) &&
        whereOr.push(`division.name ILIKE :search`);
      ctx.Role === UserRoles.MANAGER &&
        whereOr.push(`colony.name ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    if (stationId) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = stationId;
    }
    const res = await this.repository
      .createQueryBuilder('employee')
      .innerJoinAndSelect('employee.user', 'user')
      .innerJoinAndSelect('employee.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .take(paginationDto.take)
      .skip((paginationDto.page - 1) * paginationDto.take)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `employee.${sortBy}`,
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
    const params: Record<string, any> = {};
    const whereAnd = [];
    if (context.Role === UserRoles.MANAGER) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = context.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('employee')
      .innerJoinAndSelect('employee.user', 'user')
      .innerJoinAndSelect('employee.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .leftJoinAndSelect(
        'employee.occupations',
        'occupations',
        `occupations.status = 'occupied'`,
      )
      .leftJoinAndSelect('occupations.apartment', 'apartment')
      .where(buildConditions([], whereAnd))
      .setParameters(params)
      .orderBy('division.id', 'ASC')
      .stream();

    const csvStream = new PassThrough();
    const fastCsvStream = fastcsv.format({ headers: true });

    fastCsvStream.pipe(csvStream);

    res.on('data', async (row: any) => {
      res.pause();
      console.log(row);

      const csvData = {
        EmployeeName: row.user_name || '',
        Email: row.user_email || '',
        PhoneNumber: row.user_phoneNumber || '',
        Address: row.employee_address || '',
        FamilyMembers: row.employee_members ?? '',
        ProfileComplete: row.employee_profile_complete ? 'Yes' : 'No',
        RetirementDate: row.employee_retirement_date ?? '',
        YearsOfService: row.employee_years_of_service ?? '',
        YearOfInduction: row.employee_year_of_induction ?? '',
        Grade: row.employee_grade || '',
        ServiceNumber: row.employee_service_number || '',
        Division: row.division_name || '',
        Station: row.station_name || '',
        Colony: row.colony_name || '',

        ApartmentHouseNo: row.apartment_house_no || '',
        ApartmentStreetNo: row.apartment_street_no || '',
        ApartmentAddress: row.apartment_address || '',
        ApartmentDescription: row.apartment_description || '',

        LastOccupiedOn: row.occupations_last_occupied_on ?? '',

        Picture: row.employee_picture || '',
        CNICFront: row.employee_cnic_front || '',
        CNICBack: row.employee_cnic_back || '',
        ServiceCard: row.employee_service_card || '',

        CreatedAt: row.employee_created_at ?? '',
        UpdatedAt: row.employee_updated_at ?? '',
      };

      if (!fastCsvStream.write(csvData)) {
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
