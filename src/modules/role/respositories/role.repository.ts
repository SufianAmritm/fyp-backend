import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { IRoleRepository } from './interface/role-repository.interface';

@Injectable()
export class RoleRepository
  extends BaseRepository<Role>
  implements IRoleRepository
{
  constructor(
    @InjectRepository(Role)
    public readonly repository: Repository<Role>,
  ) {
    super(repository);
  }

}
