import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, User, SignUpDto);
      createMap(mapper, SignUpDto, User);
    };
  }
}
