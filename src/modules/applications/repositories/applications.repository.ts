import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { UserRoles } from '../../../common/constants/enums';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetApplicationDto } from '../dto/applications/get-applications.dto';
import { Application } from '../entities/applications.entity';
import { IApplicationRepository } from './interface/applications-repository.interface';

@Injectable()
export class ApplicationRepository
  extends BaseRepository<Application>
  implements IApplicationRepository
{
  constructor(
    @InjectRepository(Application)
    public readonly repository: Repository<Application>,
  ) {
    super(repository);
  }

  async findAll(
    getApplicationDto: GetApplicationDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Application>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getApplicationDto;
    if (search) {
      whereOr.push(`employeeUser.email ILIKE :search`);
      whereOr.push(`employeeUser.name ILIKE :search`);
      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`employeeColony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('application')
      .innerJoinAndSelect('application.colonyPriorities', 'colonyPriorities')
      .innerJoinAndSelect('colonyPriorities.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')
      .innerJoinAndSelect('application.employee', 'employee')
      .innerJoinAndSelect('employee.user', 'employeeUser')
      .leftJoinAndSelect('application.approvedBy', 'approvedBy')
      .leftJoinAndSelect('application.rejectedBy', 'rejectedBy')
      .leftJoinAndSelect('application.createdBy', 'createdBy')
      .innerJoinAndSelect('employee.colony', 'employeeColony')
      .innerJoinAndSelect('employeeColony.station', 'employeeColonyStation')
      .innerJoinAndSelect('employeeColonyStation.division', 'employeeStationDivision')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(`application.${sortBy}`, orderBy)
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }
}
