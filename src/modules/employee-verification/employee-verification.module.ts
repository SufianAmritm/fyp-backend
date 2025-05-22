import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { EmployeeModule } from '../employee/employee.module';
import { ManagersModule } from '../managers/managers.module';
import { UserModule } from '../user/user.module';
import { EmployeeVerificationController } from './employee-verification.controller';
import { EmployeeVerificationService } from './employee-verification.service';
import { EmployeeVerification } from './entities/employee-verification.entity';
import { IEmployeeVerificationService } from './interfaces/employee-verification.interface';
import { EmployeeVerificationMappingProfile } from './mapping/employee-verification.mapping';
import { EmployeeVerificationRepository } from './repositories/employee-verification.repository';
import { IEmployeeVerificationRepository } from './repositories/interface/employee-verification-repository.interface';
import { NotificationModule } from '../notifications/notification.module';
import { EventsModule } from '../events/events.module';
import { HistoryModule } from '../history/history.module';

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
  imports: [
    TypeOrmModule.forFeature(employeeVerificationEntities),
    UserModule,
    ManagersModule,
    EmailModule,
    EmployeeModule,
    NotificationModule,
    EventsModule,
    HistoryModule,
  ],
  controllers: [EmployeeVerificationController],
  providers: [
    ...employeeVerificationServiceProvider,
    ...employeeVerificationRepositoryProvider,
    EmployeeVerificationMappingProfile,
  ],
  exports: [
    ...employeeVerificationServiceProvider,
    ...employeeVerificationRepositoryProvider,
  ],
})
export class EmployeeVerificationModule {}
