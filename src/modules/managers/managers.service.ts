import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { CreateManagersDto } from './dto/create-managers.dto';
import { UpdateManagersDto } from './dto/update-managers.dto';
import { Managers } from './entities/managers.entity';
import { IManagersService } from './interfaces/managers.interface';
import { IManagersRepository } from './repositories/interface/managers-repository.interface';

@Injectable()
export class ManagersService implements IManagersService {
  constructor(
    @Inject(IManagersRepository)
    private readonly managersRepository: IManagersRepository,
    @InjectMapper() private readonly managersMapper: Mapper,
  ) {}

   async create(createManagersDto: CreateManagersDto) {
     const newManagers = this.managersMapper.map(createManagersDto, CreateManagersDto, Managers);
     return this.managersRepository.create(newManagers);
   }

  findAll(paginationDto: PaginationDto, ctx: AppContext) {
    return this.managersRepository.findAll(paginationDto, ctx);
  }

   findOne(id: number) {
     return this.managersRepository.findOne({ id });
   }

  async update(id: number, updateManagersDto: UpdateManagersDto) {
    const managersUpdate = this.managersMapper.map(
      updateManagersDto,
      CreateManagersDto,
      Managers,
    );
    await this.managersRepository.update({ id }, managersUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

   async remove(id: number) {
     await this.managersRepository.softDelete({ id });
     return RESPONSE_MESSAGES.DELETED;
   }
}