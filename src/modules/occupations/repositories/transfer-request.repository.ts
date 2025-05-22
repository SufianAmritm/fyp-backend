import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EMPLOYEE_VERIFICATION_STATUS,
  UserRoles,
} from 'src/common/constants/enums';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Repository } from 'typeorm';
import { buildConditions } from '../../../common/database/builder-pattern/build-condition';
import { AppContext } from '../../../common/interfaces/context';
import { GetTransferRequestDto } from '../dto/get-transfer-requests.dto';
import { TransferRequest } from '../entities/transfer-requests.entity';
import { ITransferRequestRepository } from './interface/transfer-request-repository.interface';

@Injectable()
export class TransferRequestRepository
  extends BaseRepository<TransferRequest>
  implements ITransferRequestRepository
{
  constructor(
    @InjectRepository(TransferRequest)
    public readonly repository: Repository<TransferRequest>,
  ) {
    super(repository);
  }
  countMyTransferRequestsNew(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('transferRequest')
      .innerJoin('transferRequest.fromColony', 'fromColony')
      .innerJoin('transferRequest.toColony', 'toColony')
      .where(
        '(fromColony.stationId = :stationId OR toColony.stationId = :stationId) AND transferRequest.status = :status AND transferRequest.createdAt >= :date',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      )
      .getCount();
  }
  countMyTransferRequests(context: AppContext): Promise<number> {
    return this.repository
      .createQueryBuilder('transferRequest')
      .innerJoin('transferRequest.fromColony', 'fromColony')
      .innerJoin('transferRequest.toColony', 'toColony')
      .where(
        '(fromColony.stationId = :stationId OR toColony.stationId = :stationId) AND transferRequest.status = :status',
        {
          stationId: context.StationId,
          status: EMPLOYEE_VERIFICATION_STATUS.PENDING,
        },
      )
      .getCount();
  }

  async findAll(
    getDto: GetTransferRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>> {
    const whereOr = [];
    const whereAnd = [];
    const params: Record<string, any> = {};

    const { search, orderBy, sortBy } = getDto;
    if (search) {
      whereOr.push(`user.name ILIKE :search`);
      whereOr.push(`user.email ILIKE :search`);
      whereOr.push(`fromColony.name ILIKE :search`);
      whereOr.push(`toColony.name ILIKE :search`);
      whereOr.push(`"transferRequest".status::text ILIKE :search`);
      whereOr.push('transferRequest.uid ILIKE :search');

      params.search = `%${search}%`;
    }
    if (ctx.Role === UserRoles.MANAGER) {
      whereOr.push(`fromColony.stationId =:stationId`);
      whereOr.push(`toColony.stationId =:stationId`);
      params.stationId = ctx.StationId;
    }
    const res = await this.repository
      .createQueryBuilder('transferRequest')
      .innerJoinAndSelect('transferRequest.fromColony', 'fromColony')
      .innerJoinAndSelect('transferRequest.toColony', 'toColony')
      .innerJoinAndSelect('fromColony.station', 'fromColonyStation')
      .innerJoinAndSelect('fromColonyStation.division', 'fromColonyDivision')
      .innerJoinAndSelect('toColony.station', 'toColonyStation')
      .innerJoinAndSelect('toColonyStation.division', 'toColonyDivision')

      .innerJoinAndSelect('transferRequest.employee', 'employee')
      .innerJoinAndSelect('employee.user', 'user')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(
        sortBy.includes('.')
          ? sortBy.split('.').slice(-2).join('.')
          : `transferRequest.${sortBy}`,
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
