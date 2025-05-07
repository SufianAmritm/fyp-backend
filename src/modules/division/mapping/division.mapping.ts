import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { Division } from '../entities/division.entity';

@Injectable()
export class DivisionMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Division, CreateDivisionDto);
      createMap(mapper, CreateDivisionDto, Division);
    };
  }
}