import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeVerification } from './entities/employee-verification.entity';
import { IEmployeeVerificationService } from './interfaces/employee-verification.interface';
import { EmployeeVerificationMappingProfile } from './mapping/employee-verification.mapping';
import { EmployeeVerificationController } from './employee-verification.controller';
import { IEmployeeVerificationRepository } from './repositories/interface/employee-verification-repository.interface';
import { EmployeeVerificationRepository } from './repositories/employee-verification.repository';
import { EmployeeVerificationService } from './employee-verification.service';

const employeeVerificationEntities = [EmployeeVerification];
const employeeVerificationRepositoryProvider = [
  {
    provide: IEmployeeVerificationRepository,
    useClass: EmployeeVerificationRepository,
  },
];
const employeeVerificationServiceProvider = [
  {
    provide: IEmployeeVerificationService,
    useClass: EmployeeVerificationService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(employeeVerificationEntities)],
  controllers: [EmployeeVerificationController],
  providers: [
    ...employeeVerificationServiceProvider,
    ...employeeVerificationRepositoryProvider,
    EmployeeVerificationMappingProfile,
  ],
  exports: [...employeeVerificationServiceProvider],
})
export class EmployeeVerificationModule {}