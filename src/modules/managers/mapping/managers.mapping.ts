import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateManagersDto } from '../dto/create-managers.dto';
import { Managers } from '../entities/managers.entity';

@Injectable()
export class ManagersMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Managers, CreateManagersDto);
      createMap(mapper, CreateManagersDto, Managers);
    };
  }
}