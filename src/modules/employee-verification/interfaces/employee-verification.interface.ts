import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateEmployeeVerificationDto } from '../dto/create-employee-verification.dto';
import { UpdateEmployeeVerificationDto } from '../dto/update-employee-verification.dto';
import { EmployeeVerification } from '../entities/employee-verification.entity';

export const IEmployeeVerificationService = Symbol(
  'IEmployeeVerificationService',
);
export interface IEmployeeVerificationService {
  create(createEmployeeVerificationDto: CreateEmployeeVerificationDto);
  findAll(paginationDto: PaginationDto, ctx: AppContext);
  findOne(id: number);
  update(
    id: number,
    updateEmployeeVerificationDto: UpdateEmployeeVerificationDto,
    userId: number,
  );
  getEmployeeVerificationStatus(
    employeeId: number,
  ): Promise<EmployeeVerification>;
}
