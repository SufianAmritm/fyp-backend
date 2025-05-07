import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { ORDER_BY } from 'src/common/constants/enums';
import { FindOptionsBuilder } from 'src/common/database/builder-pattern/find-options.builder';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { IRolePermissionRepository } from './interface/role-permission-repository.interface';
import { RolePermission } from '../entities/role-permission.entity';

@Injectable()
export class RolePermissionRepository
  extends BaseRepository<RolePermission>
  implements IRolePermissionRepository
{
  constructor(
    @InjectRepository(RolePermission)
    public readonly repository: Repository<RolePermission>,
  ) {
    super(repository);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PagedList<RolePermission>> {
    const findOption = new FindOptionsBuilder<RolePermission>()
      .where({
        deletedAt: null,
      })
      .order({ id: ORDER_BY.DESC })
      .build();
    return this.findWithPagination(paginationDto, findOption);
  }
}
