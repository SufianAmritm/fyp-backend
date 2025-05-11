import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { RolePermission } from './entities/role-permission.entity';
import { IRolePermissionRepository } from './respositories/interface/role-permission-repository.interface';
import { RolePermissionRepository } from './respositories/role-permission.repository';
import { IRolePermissionService } from './interfaces/role-permission.interface';
import { RolePermissionMappingProfile } from './mapping/role-permission.mapping';

const rolePermissionEntities = [RolePermission];
const roleRepositoryProvider = [
  {
    provide: IRolePermissionRepository,
    useClass: RolePermissionRepository,
  },
];
const roleServiceProvider = [
  {
    provide: IRolePermissionService,
    useClass: RolePermissionService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(rolePermissionEntities)],
  controllers: [RolePermissionController],
  providers: [
    ...roleServiceProvider,
    ...roleRepositoryProvider,
    RolePermissionMappingProfile,
  ],
  exports: [...roleServiceProvider],
})
export class RolePermissionModule {}
