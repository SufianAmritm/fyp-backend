import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import { AppSetting } from '../entities/settings.entity';

@Injectable()
export class SettingsMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, AppSetting, CreateSettingsDto);
      createMap(mapper, CreateSettingsDto, AppSetting);
    };
  }
}
