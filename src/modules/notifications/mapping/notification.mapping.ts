import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UserNotification } from '../entities/user-notifications.entity';

@Injectable()
export class UserNotificationMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, UserNotification, CreateNotificationDto);
      createMap(mapper, CreateNotificationDto, UserNotification);
    };
  }
}
