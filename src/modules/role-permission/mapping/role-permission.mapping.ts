import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateRolePermissionDto } from '../dto/create-role-permission.dto';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, RolePermission, CreateRolePermissionDto);
      createMap(mapper, CreateRolePermissionDto, RolePermission);
    };
  }
}
