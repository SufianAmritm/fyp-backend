import { UserRoles } from '../../../common/constants/enums/index';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';

export const IRoleService = Symbol('IRoleService');
export interface IRoleService {
  create(createRoleDto: CreateRoleDto): Promise<Role>;
  findAll(): Promise<Role[]>;
  findOne(id: number): Promise<Role>;
  findOneByName(name: UserRoles): Promise<Role>;
  update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role>;
  remove(id: number): Promise<string>;
}
