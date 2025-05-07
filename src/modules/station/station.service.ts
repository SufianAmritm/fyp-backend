import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { CreateStationDto } from './dto/create-station.dto';
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
    const newStation = this.stationMapper.map(
      createStationDto,
      CreateStationDto,
      Station,
    );
    return this.stationRepository.create(newStation);
  }

  findAll(paginationDto: PaginationDto) {
    return this.stationRepository.findAll(paginationDto);
  }

  findOne(id: number) {
    return this.stationRepository.findOne({ id });
  }

  async update(id: number, updateStationDto: UpdateStationDto) {
    const stationUpdate = this.stationMapper.map(
      updateStationDto,
      CreateStationDto,
      Station,
    );
    await this.stationRepository.update({ id }, stationUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.stationRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
