import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateApplicationPriorityDto } from '../dto/application-colonies/create-applications-priority.dto';
import { CreateApplicationDto } from '../dto/applications/create-applications.dto';
import { ApplicationPriority } from '../entities/application-colonies.entity';
import { Application } from '../entities/applications.entity';
import { UpdateApplicationDto } from '../dto/applications/update-applications.dto';

@Injectable()
export class ApplicationMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Application, CreateApplicationDto);
      createMap(mapper, CreateApplicationDto, Application);
      createMap(mapper, UpdateApplicationDto, Application);

      createMap(mapper, ApplicationPriority, CreateApplicationPriorityDto);
      createMap(mapper, CreateApplicationPriorityDto, ApplicationPriority);
    };
  }
}
