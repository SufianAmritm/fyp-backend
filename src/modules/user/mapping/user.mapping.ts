import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { CreateAdminDto } from '../../admin/dto/create-admin.dto';
import { CreateEmployeeDto } from '../../employee/dto/create-employee.dto';
import { CreateManagersDto } from '../../managers/dto/create-managers.dto';
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
      createMap(mapper, CreateAdminDto, User);
      createMap(
        mapper,
        CreateManagersDto,
        User,
        forMember(
          (x) => x.name,
          mapFrom((source) => source.name),
        ),
        forMember(
          (x) => x.email,
          mapFrom((source) => source.email),
        ),
        forMember(
          (x) => x.phoneNumber,
          mapFrom((source) => source.phoneNumber),
        ),
      );
      createMap(mapper, CreateEmployeeDto, User);
    };
  }
}
