import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/common/constants/enums';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
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
}
