import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateColonyDto } from '../dto/create-colony.dto';
import { Colony } from '../entities/colony.entity';

@Injectable()
export class ColonyMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Colony, CreateColonyDto);
      createMap(mapper, CreateColonyDto, Colony);
    };
  }
}