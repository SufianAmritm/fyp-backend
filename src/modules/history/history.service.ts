import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { HISTORY_TYPE } from '../../common/constants/enums';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { PagedList } from '../../common/types/paged-list';
import { CreateHistoryDto } from './dto/create-history.dto';
import { History } from './entities/history.entity';
import { IHistoryService } from './interfaces/history.interface';
import { IHistoryRepository } from './repositories/interface/history-repository.interface';

@Injectable()
export class HistoryService implements IHistoryService {
  constructor(
    @Inject(IHistoryRepository)
    private readonly historyRepository: IHistoryRepository,
    @InjectMapper() private readonly historyMapper: Mapper,
  ) {}
  async bulkCreate(dto: CreateHistoryDto[]): Promise<void> {
    const newHistory = this.historyMapper.mapArray(
      dto,
      CreateHistoryDto,
      History,
    );
    await this.historyRepository.bulkCreate(newHistory);
  }
  findOneApartment(
    id: number,
    paginationDto: PaginationDto,
  ): Promise<PagedList<History>> {
    const findOptions = new FindOptionsBuilder<History>()
      .where({
        apartmentId: id,
        type: HISTORY_TYPE.APARTMENT,
      })
      .order({
        createdAt: 'DESC',
      })
      .build();
    return this.historyRepository.findWithPagination(
      paginationDto,
      findOptions,
    );
  }
  async findOneEmployee(
    id: number,
    paginationDto: PaginationDto,
  ): Promise<PagedList<History>> {
    const findOptions = new FindOptionsBuilder<History>()

      .where({
        employeeId: id,
        type: HISTORY_TYPE.EMPLOYEE,
      })
      .order({
        createdAt: 'DESC',
      })
      .build();
    return this.historyRepository.findWithPagination(
      paginationDto,
      findOptions,
    );
  }

  async create(createHistoryDto: CreateHistoryDto) {
    const newHistory = this.historyMapper.map(
      createHistoryDto,
      CreateHistoryDto,
      History,
    );
    return this.historyRepository.create(newHistory);
  }
}
