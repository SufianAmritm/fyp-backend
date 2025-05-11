import { CreateRolePermissionDto } from '../dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from '../dto/update-role-permission.dto';
import { RolePermission } from '../entities/role-permission.entity';

export const IRolePermissionService = Symbol('IRolePermissionService');
export interface IRolePermissionService {
  create(
    createRolePermissionDto: CreateRolePermissionDto,
  ): Promise<RolePermission>;
  findAll(): Promise<{ component: string; canAccess: string; role: string }[]>;
  findOne(id: number): Promise<RolePermission>;
  findByRoleId(id: number): Promise<RolePermission[]>;
  update(
    id: number,
    updateRolePermissionDto: UpdateRolePermissionDto,
  ): Promise<RolePermission>;
  remove(id: number): Promise<string>;
}
