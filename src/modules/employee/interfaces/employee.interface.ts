import { CreateEmployeeDto } from '../dto/create-employee.dto';

export const IEmployeeService = Symbol('IEmployeeService');
export interface IEmployeeService {
  create(
    createEmployeeDto: CreateEmployeeDto,
    cnicFront: Express.Multer.File,
    cnicBack: Express.Multer.File,
    serviceCard: Express.Multer.File,
    picture?: Express.Multer.File,
  );
}
