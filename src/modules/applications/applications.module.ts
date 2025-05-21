import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { EmailModule } from '../email/email.module';
import { EmployeeVerificationModule } from '../employee-verification/employee-verification.module';
import { EmployeeModule } from '../employee/employee.module';
import { ManagersModule } from '../managers/managers.module';
import { OccupationModule } from '../occupations/occupations.module';
import { UserModule } from '../user/user.module';
import { ApplicationController } from './applications.controller';
import { ApplicationService } from './applications.service';
import { ApplicationPriority } from './entities/application-colonies.entity';
import { Application } from './entities/applications.entity';
import { IApplicationService } from './interfaces/applications.interface';
import { ApplicationMappingProfile } from './mapping/applications.mapping';
import { ApplicationPriorityRepository } from './repositories/application-priority.repository';
import { ApplicationRepository } from './repositories/applications.repository';
import { IApplicationPriorityRepository } from './repositories/interface/application-priority-repository.interface';
import { IApplicationRepository } from './repositories/interface/applications-repository.interface';
import { NotificationModule } from '../notifications/notification.module';
import { EventsGateway } from '../events/events.gateway';
import { EventsModule } from '../events/events.module';
import { HistoryModule } from '../history/history.module';

const applicationsEntities = [Application, ApplicationPriority];
const applicationsRepositoryProvider = [
  {
    provide: IApplicationRepository,
    useClass: ApplicationRepository,
  },
  {
    provide: IApplicationPriorityRepository,
    useClass: ApplicationPriorityRepository,
  },
];
const applicationsServiceProvider = [
  {
    provide: IApplicationService,
    useClass: ApplicationService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(applicationsEntities),
    OccupationModule,
    EmployeeVerificationModule,
    EmployeeModule,
    UserModule,
    ManagersModule,
    EmailModule,
    NotificationModule,
    EventsModule,
    HistoryModule,
  ],
  controllers: [ApplicationController],
  providers: [
    ...applicationsServiceProvider,
    ...applicationsRepositoryProvider,
    ApplicationMappingProfile,
    DbTransactionFactory,
  ],
  exports: [...applicationsServiceProvider],
})
export class ApplicationModule {}
