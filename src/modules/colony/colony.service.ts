import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateColonyDto } from './dto/create-colony.dto';
import { GetColonyDto } from './dto/request/get.dto';
import { UpdateColonyDto } from './dto/update-colony.dto';
import { Colony } from './entities/colony.entity';
import { IColonyService } from './interfaces/colony.interface';
import { IColonyRepository } from './repositories/interface/colony-repository.interface';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';

@Injectable()
export class ColonyService implements IColonyService {
  constructor(
    @Inject(IColonyRepository)
    private readonly colonyRepository: IColonyRepository,
    @InjectMapper() private readonly colonyMapper: Mapper,
  ) {}

  async create(createColonyDto: CreateColonyDto) {
    const { name, stationId } = createColonyDto;
    const exists = await this.colonyRepository.findOne({
      name,
      stationId,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Colony', 'name: ' + name),
      );
    }
    const newColony = this.colonyMapper.map(
      createColonyDto,
      CreateColonyDto,
      Colony,
    );
    return this.colonyRepository.create(newColony);
  }

  findAll(getColonyDto: GetColonyDto, paginationDto: PaginationDto) {
    return this.colonyRepository.findAll(getColonyDto, paginationDto);
  }

  findOne(id: number) {
    const findOption = new FindOptionsBuilder<Colony>()
      .where({ id })
      .relations({
        apartments: true,
      })
      .build();
    return this.colonyRepository.findOneWithBuilderOption(findOption);
  }

  async update(id: number, updateColonyDto: UpdateColonyDto) {
    const colonyUpdate = this.colonyMapper.map(
      updateColonyDto,
      CreateColonyDto,
      Colony,
    );
    await this.colonyRepository.update({ id }, colonyUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.colonyRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
