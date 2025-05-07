import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { Division } from './entities/division.entity';
import { IDivisionService } from './interfaces/division.interface';
import { IDivisionRepository } from './repositories/interface/division-repository.interface';

@Injectable()
export class DivisionService implements IDivisionService {
  constructor(
    @Inject(IDivisionRepository)
    private readonly divisionRepository: IDivisionRepository,
    @InjectMapper() private readonly divisionMapper: Mapper,
  ) {}

  async create(createDivisionDto: CreateDivisionDto) {
    const newDivision = this.divisionMapper.map(
      createDivisionDto,
      CreateDivisionDto,
      Division,
    );
    return this.divisionRepository.create(newDivision);
  }

  findAll(paginationDto: PaginationDto) {
    return this.divisionRepository.findAll(paginationDto);
  }

  findOne(id: number) {
    return this.divisionRepository.findOne({ id });
  }

  async update(id: number, updateDivisionDto: UpdateDivisionDto) {
    const divisionUpdate = this.divisionMapper.map(
      updateDivisionDto,
      CreateDivisionDto,
      Division,
    );
    await this.divisionRepository.update({ id }, divisionUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.divisionRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
