import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';
import { PagedList } from 'src/common/types/paged-list';
import { AppContext } from '../../../../common/interfaces/context';
import { EmployeeVerification } from '../../entities/employee-verification.entity';
import { GetEmployeeVerificationDto } from '../../dto/get-employee-verification.dto';

export const IEmployeeVerificationRepository = Symbol(
  'IEmployeeVerificationRepository',
);

type DefaultEntity = EmployeeVerification;
export interface IEmployeeVerificationRepository<T = DefaultEntity>
  extends IBaseRepository<T> {
  findAll(
    getDto: GetEmployeeVerificationDto,

    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<EmployeeVerification>>;
}
