import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersModule } from '../managers/managers.module';
import { UserModule } from '../user/user.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { IEmployeeService } from './interfaces/employee.interface';
import { EmployeeMappingProfile } from './mapping/employee.mapping';
import { EmployeeRepository } from './repositories/employee.repository';
import { IEmployeeRepository } from './repositories/interface/employee-repository.interface';

const employeeEntities = [Employee];
const employeeRepositoryProvider = [
  {
    provide: IEmployeeRepository,
    useClass: EmployeeRepository,
  },
];
const employeeServiceProvider = [
  {
    provide: IEmployeeService,
    useClass: EmployeeService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(employeeEntities),
    UserModule,
    ManagersModule,
  ],
  controllers: [EmployeeController],
  providers: [
    ...employeeServiceProvider,
    ...employeeRepositoryProvider,
    EmployeeMappingProfile,
  ],
  exports: [...employeeServiceProvider],
})
export class EmployeeModule {}
