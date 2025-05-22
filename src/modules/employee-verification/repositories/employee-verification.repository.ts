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
import { GetEmployeeVerificationDto } from '../dto/get-employee-verification.dto';
import { EmployeeVerification } from '../entities/employee-verification.entity';
import { IEmployeeVerificationRepository } from './interface/employee-verification-repository.interface';

@Injectable()
export class EmployeeVerificationRepository
  extends BaseRepository<EmployeeVerification>
  implements IEmployeeVerificationRepository
{
  constructor(
    @InjectRepository(EmployeeVerification)
    public readonly repository: Repository<EmployeeVerification>,
  ) {
    super(repository);
  }
  countMyVerificationsNew(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('employeeVerifications')
      .innerJoin('employeeVerifications.employee', 'employee')
      .innerJoin('employee.colony', 'colony')
      .where(
        'colony.stationId = :stationId AND employeeVerifications.status = :status AND employeeVerifications.createdAt >= :date',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      )
      .getCount();
  }
  countMyVerifications(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('employeeVerifications')
      .innerJoin('employeeVerifications.employee', 'employee')
      .innerJoin('employee.colony', 'colony')
      .where(
        'colony.stationId = :stationId AND employeeVerifications.status = :status',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
      )
      .getCount();
  }

  async findAll(
    getDto: GetEmployeeVerificationDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<EmployeeVerification>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDto;
    if (search) {
      whereOr.push(`user.name ILIKE :search`);
      whereOr.push(`user.email ILIKE :search`);
      whereOr.push(`station.name ILIKE :search`);
      whereOr.push(`"employeeVerifications".status::text ILIKE :search`);

      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereAnd.push(`colony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('employeeVerifications')
      .innerJoinAndSelect('employeeVerifications.employee', 'employee')
      .innerJoinAndSelect('employee.user', 'user')
      .innerJoinAndSelect('employee.colony', 'colony')
      .innerJoinAndSelect('colony.station', 'station')
      .leftJoinAndSelect('employeeVerifications.approvedBy', 'approvedBy')
      .leftJoinAndSelect('employeeVerifications.rejectedBy', 'rejectedBy')
      .leftJoinAndSelect('employeeVerifications.createdBy', 'createdBy')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `employeeVerifications.${sortBy}`,
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
