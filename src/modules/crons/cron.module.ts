import { Module } from '@nestjs/common';
import { EmployeeModule } from '../employee/employee.module';
import { EventsModule } from '../events/events.module';
import { HistoryModule } from '../history/history.module';
import { ManagersModule } from '../managers/managers.module';
import { NotificationModule } from '../notifications/notification.module';
import { OccupationModule } from '../occupations/occupations.module';
import { UserModule } from '../user/user.module';
import { RetirementCron } from './services/retirement-cron';
import { OccupationCronService } from './services/vacany.cron';

@Module({
  imports: [
    OccupationModule,
    EmployeeModule,
    NotificationModule,
    UserModule,
    ManagersModule,
    HistoryModule,
    EventsModule,
  ],
  providers: [OccupationCronService, RetirementCron],
})
export class CronModule {}
