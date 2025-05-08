import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Equal, Not } from 'typeorm';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { GetStationDto } from './dto/request/get.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Station } from './entities/station.entity';
import { IStationService } from './interfaces/station.interface';
import { IStationRepository } from './repositories/interface/station-repository.interface';

@Injectable()
export class StationService implements IStationService {
  constructor(
    @Inject(IStationRepository)
    private readonly stationRepository: IStationRepository,
    @InjectMapper() private readonly stationMapper: Mapper,
  ) {}

  async create(createStationDto: CreateStationDto) {
    const { name, divisionId } = createStationDto;
    const exists = await this.stationRepository.findOne({
      name,
      divisionId,
    });
    if (exists) {
      throw new BadRequestException(
        APP_ERROR_MESSAGES.ALREADY_EXISTS('Station', 'name: ' + name),
      );
    }
    const newStation = this.stationMapper.map(
      createStationDto,
      CreateStationDto,
      Station,
    );
    return this.stationRepository.create(newStation);
  }

  findAll(getStationDto: GetStationDto, paginationDto: PaginationDto) {
    return this.stationRepository.findAll(getStationDto, paginationDto);
  }

  async findOne(id: number) {
    const findOptions = new FindOptionsBuilder<Station>()
      .where({
        id,
      })
      .relations({
        managers: {
          user: true,
        },
      })
      .build();

    const stations =
      await this.stationRepository.findOneWithBuilderOption(findOptions);
    stations.managers = stations.managers.map((manager) => {
      manager.user.password = undefined;
      return { ...manager, ...manager.user };
    });
  }

  async update(id: number, updateStationDto: UpdateStationDto) {
    const { name, divisionId } = updateStationDto;
    if (name) {
      const exists = await this.stationRepository.findOne({
        name,
        divisionId,
        id: Not(Equal(id)),
      });
      if (exists) {
        throw new BadRequestException(
          APP_ERROR_MESSAGES.ALREADY_EXISTS('Station', 'name: ' + name),
        );
      }
    }
    const stationUpdate = this.stationMapper.map(
      updateStationDto,
      CreateStationDto,
      Station,
    );
    await this.stationRepository.update({ id }, stationUpdate);
    return this.stationRepository.findOne({ id });
  }

  async remove(id: number) {
    const findOptions = new FindOptionsBuilder<Station>()
      .where({ id })
      .relations({})
      .build();
    const station =
      await this.stationRepository.findOneWithBuilderOption(findOptions);
    if (!station) {
      throw new BadRequestException(APP_ERROR_MESSAGES.NOT_FOUND('Station'));
    }
    await this.stationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
