import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { User } from '../../entities/user.entity';

export const IUserRepository = Symbol('IUserRepository');

type DefaultEntity = User;
export interface IUserRepository<T = DefaultEntity> extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<User>>;
  updateManagerPicture(userId: number, picture: string): Promise<void>;
}
