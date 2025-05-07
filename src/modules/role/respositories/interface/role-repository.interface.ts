import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { Role } from '../../entities/role.entity';

export const IRoleRepository = Symbol('IRoleRepository');

type DefaultEntity = Role;
export interface IRoleRepository<T = DefaultEntity> extends IBaseRepository<T> {
}
