import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from 'src/common/constants';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { RolePermission } from './entities/role-permission.entity';
import { IRolePermissionService } from './interfaces/role-permission.interface';
import { IRolePermissionRepository } from './respositories/interface/role-permission-repository.interface';

@Injectable()
export class RolePermissionService implements IRolePermissionService {
  constructor(
    @Inject(IRolePermissionRepository)
    private readonly rolePermissionRepository: IRolePermissionRepository,
    @InjectMapper() private readonly roleMapper: Mapper,
  ) {}

  async create(createRoleDto: CreateRolePermissionDto) {
    const newRolePermission = this.roleMapper.map(
      createRoleDto,
      CreateRolePermissionDto,
      RolePermission,
    );
    return this.rolePermissionRepository.create(newRolePermission);
  }

  async findAll() {
    const permissions=await this.rolePermissionRepository.find();
    return permissions.map(perm=>({
      component:perm.component,
      canAccess:perm.canAccess,
      role:perm.role.name,
    }))
  }

  async findOne(id: number) {
    return this.rolePermissionRepository.findOne({ id });
  }

  async findByRoleId(id: number) {
    return this.rolePermissionRepository.find({ roleId: id });
  }

  async update(id: number, updateRolePermissionDto: UpdateRolePermissionDto) {
    const roleUpdate = this.roleMapper.map(
      updateRolePermissionDto,
      CreateRolePermissionDto,
      RolePermission,
    );
    await this.rolePermissionRepository.update({ id }, roleUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.rolePermissionRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
