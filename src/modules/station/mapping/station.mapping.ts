import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateStationDto } from '../dto/create-station.dto';
import { Station } from '../entities/station.entity';

@Injectable()
export class StationMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Station, CreateStationDto);
      createMap(mapper, CreateStationDto, Station);
    };
  }
}