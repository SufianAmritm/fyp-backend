import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Equal, Not } from 'typeorm';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AppContext } from '../../common/interfaces/context';
import { CreateDivisionDto } from './dto/create-division.dto';
import { GetDivisionsDto } from './dto/request/get.dto';
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
    const { name } = createDivisionDto;
    const exists = await this.divisionRepository.findOne({
      name,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Division', `name: ${name}`),
      );
    }
    const newDivision = this.divisionMapper.map(
      createDivisionDto,
      CreateDivisionDto,
      Division,
    );
    return this.divisionRepository.create(newDivision);
  }

  findAll(
    getDivisionDto: GetDivisionsDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ) {
    return this.divisionRepository.findAll(getDivisionDto, paginationDto, ctx);
  }

  findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Division>()
      .where({
        id,
      })
      .relations({
        stations: true,
      })
      .build();

    return this.divisionRepository.findOneWithBuilderOption(findOptions);
  }

  async update(id: number, updateDivisionDto: UpdateDivisionDto) {
    const { name } = updateDivisionDto;
    if (name) {
      const exists = await this.divisionRepository.findOne({
        name: updateDivisionDto.name,
        id: Not(Equal(id)),
      });
      if (exists) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS(
            'Division',
            `name: ${updateDivisionDto.name}`,
          ),
        );
      }
    }
    const divisionUpdate = this.divisionMapper.map(
      updateDivisionDto,
      CreateDivisionDto,
      Division,
    );
    await this.divisionRepository.update({ id }, divisionUpdate);
    return this.divisionRepository.findOne({ id });
  }

  async remove(id: number) {
    const findOptions = new FindOptionsBuilder<Division>()
      .where({ id })
      .relations({
        stations: true,
      })
      .build();
    const division =
      await this.divisionRepository.findOneWithBuilderOption(findOptions);
    if (!division) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Division'));
    }
    if (division.stations.length > 0) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.IN_USE('Division', ['Stations']),
      );
    }
    await this.divisionRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
