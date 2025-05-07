import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateAppLogDto } from '../dto/create-app-log.dto';
import { AppLog } from '../entities/app-log.entity';

@Injectable()
export class AppLogMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, AppLog, CreateAppLogDto);
      createMap(mapper, CreateAppLogDto, AppLog);
    };
  }
}
