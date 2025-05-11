import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { Employee } from '../../entities/employee.entity';
import { AppContext } from '../../../../common/interfaces/context';

export const IEmployeeRepository = Symbol(
  'IEmployeeRepository',
);

type DefaultEntity = Employee;
export interface IEmployeeRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
    findAll(
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Employee>>;
}