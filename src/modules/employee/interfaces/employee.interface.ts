import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';

export const IEmployeeService = Symbol('IEmployeeService');
export interface IEmployeeService {
  create(
    createEmployeeDto: CreateEmployeeDto,
    cnicFront: Express.Multer.File,
    cnicBack: Express.Multer.File,
    serviceCard: Express.Multer.File,
    picture?: Express.Multer.File,
  );

  findOne(id: number): Promise<Employee>;
  findOneByUserId(userId: number): Promise<Employee>;
  findOneByUserIdWithColonies(userId: number): Promise<Employee>;
  findAll(paginationDto: PaginationDto, ctx: AppContext);
  update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
    userId: number,
    cnicFront: Express.Multer.File,
    cnicBack: Express.Multer.File,
    serviceCard: Express.Multer.File,
    picture?: Express.Multer.File,
  );
}
