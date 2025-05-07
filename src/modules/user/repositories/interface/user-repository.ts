import { BaseRepository } from 'src/common/base/repository/base/base.repository';
import { User } from '../../entities/user.entity';
export const IUserRepository = Symbol('IUserRepository');
type DefaultEntity = User;
export interface IUserRepository<T = DefaultEntity> extends BaseRepository<T> {}
