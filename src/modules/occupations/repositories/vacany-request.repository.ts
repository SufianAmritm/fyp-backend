import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  UserRoles,
} from '../../../common/constants/enums';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetVacancyRequestDto } from '../dto/get-vacany-requests.dto';
import { VacancyRequest } from '../entities/vacancy-requests.entity';
import { IVacancyRequestRepository } from './interface/vacancy-requests-repository.interface';

@Injectable()
export class VacancyRequestRepository
  extends BaseRepository<VacancyRequest>
  implements IVacancyRequestRepository
{
  constructor(
    @InjectRepository(VacancyRequest)
    public readonly repository: Repository<VacancyRequest>,
  ) {
    super(repository);
  }
  countMyVacancyRequestsNew(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('vacancyRequest')
      .innerJoin('vacancyRequest.occupation', 'occupation')
      .innerJoin('occupation.apartment', 'apartment')
      .innerJoin('apartment.colony', 'colony')

      .where(
        'colony.stationId = :stationId AND vacancyRequest.status = :status AND vacancyRequest.createdAt >= :date',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      )
      .getCount();
  }
  countMyVacancyRequests(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('vacancyRequest')
      .innerJoin('vacancyRequest.occupation', 'occupation')
      .innerJoin('occupation.apartment', 'apartment')
      .innerJoin('apartment.colony', 'colony')

      .where(
        'colony.stationId = :stationId AND vacancyRequest.status = :status',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
      )
      .getCount();
  }

  async findAll(
    getDto: GetVacancyRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<VacancyRequest>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDto;
    if (search) {
      whereOr.push(`user.name ILIKE :search`);
      whereOr.push(`user.email ILIKE :search`);
      whereOr.push(`apartment.houseNo ILIKE :search`);
      whereOr.push(`apartment.streetNo ILIKE :search`);
      whereOr.push(`colony.name ILIKE :search`);
      whereOr.push(`"vacancyRequest".status::text ILIKE :search`);
      whereOr.push('vacancyRequest.uid ILIKE :search');

      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    if (ctx.Role === UserRoles.EMPLOYEE) {
      whereAnd.push(`user.id =:userId`);
      params.userId = ctx.UserId;
    }
    const res = await this.repository
      .createQueryBuilder('vacancyRequest')
      .innerJoinAndSelect('vacancyRequest.occupation', 'occupation')
      .innerJoinAndSelect('occupation.apartment', 'apartment')
      .innerJoinAndSelect('apartment.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .innerJoinAndSelect('station.division', 'division')

      .innerJoinAndSelect('vacancyRequest.employee', 'employee')
      .innerJoinAndSelect('employee.colony', 'employeeColony')
      .innerJoinAndSelect('employeeColony.station', 'employeeColonyStation')
      .innerJoinAndSelect(
        'employeeColonyStation.division',
        'employeeColonyStationDivision',
      )
      .innerJoinAndSelect('employee.user', 'user')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .take(paginationDto.take)
      .skip((paginationDto.page - 1) * paginationDto.take)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `vacancyRequest.${sortBy}`,
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
