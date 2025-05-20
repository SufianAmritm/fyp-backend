import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { GetEmployeeDto } from '../../dto/get-employee-dto';
import { Employee } from '../../entities/employee.entity';

export const IEmployeeRepository = Symbol('IEmployeeRepository');

type DefaultEntity = Employee;
export interface IEmployeeRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getEmployeeDto: GetEmployeeDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<Employee>>;
  downloadCsv(context: AppContext);
}
