import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { RolePermission } from '../../entities/role-permission.entity';

export const IRolePermissionRepository = Symbol('IRolePermissionRepository');

type DefaultEntity = RolePermission;
export interface IRolePermissionRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<RolePermission>>;
}
