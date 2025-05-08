import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { RESPONSE_MESSAGES } from 'src/common/constants';
import { UserRoles } from '../../common/constants/enums';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { IRoleService } from './interfaces/role.interface';
import { IRoleRepository } from './respositories/interface/role-repository.interface';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject(IRoleRepository) private readonly roleRepository: IRoleRepository,
    @InjectMapper() private readonly roleMapper: Mapper,
  ) {}
  findOneByName(name: UserRoles): Promise<Role> {
    return this.roleRepository.findOne({
      name,
    });
  }

  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.roleMapper.map(createRoleDto, CreateRoleDto, Role);
    return this.roleRepository.create(newRole);
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    return this.roleRepository.findOne({ id });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const roleUpdate = this.roleMapper.map(updateRoleDto, CreateRoleDto, Role);
    await this.roleRepository.update({ id }, roleUpdate);
    return RESPONSE_MESSAGES.UPDATED;
  }

  async remove(id: number) {
    await this.roleRepository.softDelete({ id });
    return RESPONSE_MESSAGES.DELETED;
  }
}
