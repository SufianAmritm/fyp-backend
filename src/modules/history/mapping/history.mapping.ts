import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from '../dto/create-history.dto';
import { History } from '../entities/history.entity';

@Injectable()
export class HistoryMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, History, CreateHistoryDto);
      createMap(mapper, CreateHistoryDto, History);
    };
  }
}