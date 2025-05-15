import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoles } from 'src/common/constants/enums';
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
      .innerJoinAndSelect('toColony.station', 'toColonyStation')
      .innerJoinAndSelect('transferRequest.employee', 'employee')
      .innerJoinAndSelect('employee.user', 'user')
      .where(buildConditions(whereOr, whereAnd))
      .setParameters(params)
      .orderBy(`transferRequest.${sortBy}`, orderBy)
      .getManyAndCount();
    return new PagedList(
      res[0],
      res[1],
      paginationDto.take,
      paginationDto.page,
    );
  }
}
