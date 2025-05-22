import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IDashboardService } from './interfaces/dashboard.interface';
import { DivisionModule } from '../division/division.module';
import { ApartmentModule } from '../apartment/apartment.module';
import { ColonyModule } from '../colony/colony.module';
import { StationModule } from '../station/station.module';
import { EmployeeModule } from '../employee/employee.module';
import { EmployeeVerificationModule } from '../employee-verification/employee-verification.module';
import { OccupationModule } from '../occupations/occupations.module';
import { ManagersModule } from '../managers/managers.module';
import { ApplicationModule } from '../applications/applications.module';
const dashboardServiceProvider = [
  {
    provide: IDashboardService,
    useClass: DashboardService,
  },
];
@Module({
  imports: [
    DivisionModule,
    ApartmentModule,
    ColonyModule,
    StationModule,
    EmployeeModule,
    EmployeeVerificationModule,
    OccupationModule,
    ManagersModule,
    ApplicationModule
  ],
  controllers: [DashboardController],
  providers: [...dashboardServiceProvider],
  exports: [...dashboardServiceProvider],
})
export class DashboardModule {}
