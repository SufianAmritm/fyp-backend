import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { UpdateManagersDto } from '../../../managers/dto/update-managers.dto';
import { User } from '../../entities/user.entity';
import { UpdateEmployeeDto } from '../../../employee/dto/update-employee.dto';

export const IUserRepository = Symbol('IUserRepository');

type DefaultEntity = User;
export interface IUserRepository<T = DefaultEntity> extends IBaseRepository<T> {
  findAll(paginationDto: PaginationDto): Promise<PagedList<User>>;
  updateManagerFromUser(userId: number, dto: UpdateManagersDto): Promise<void>;
  updateEmployeeFromUser(userId: number, dto: UpdateEmployeeDto): Promise<void>;
}
