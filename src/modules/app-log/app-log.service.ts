import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateAppLogDto } from './dto/create-app-log.dto';
import { AppLog } from './entities/app-log.entity';
import { IAppLogService } from './interfaces/app-log.interface';
import { IAppLogRepository } from './repositories/interface/app-log-repository.interface';

@Injectable()
export class AppLogService implements IAppLogService {
  constructor(
    @Inject(IAppLogRepository)
    private readonly appLogRepository: IAppLogRepository,
    @InjectMapper() private readonly appLogMapper: Mapper,
  ) {}

  async create(createAppLogDto: CreateAppLogDto) {
    const newAppLog = this.appLogMapper.map(
      createAppLogDto,
      CreateAppLogDto,
      AppLog,
    );
    return await this.appLogRepository.create(newAppLog);
  }

  findAll(paginationDto: PaginationDto) {
    return this.appLogRepository.findAll(paginationDto);
  }
}
