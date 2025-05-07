import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { IRoleService } from './interfaces/role.interface';
import { RoleMappingProfile } from './mapping/role.mapping';
import { IRoleRepository } from './respositories/interface/role-repository.interface';
import { RoleRepository } from './respositories/role.repository';
import { RoleService } from './role.service';

const roleEntities = [Role];
const roleRepositoryProvider = [
  {
    provide: IRoleRepository,
    useClass: RoleRepository,
  },
];
const roleServiceProvider = [
  {
    provide: IRoleService,
    useClass: RoleService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(roleEntities)],
  providers: [
    ...roleServiceProvider,
    ...roleRepositoryProvider,
    RoleMappingProfile,
  ],
  exports: [...roleServiceProvider],
})
export class RoleModule {}
