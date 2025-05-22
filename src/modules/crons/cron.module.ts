import { Module } from '@nestjs/common';
import { OccupationModule } from '../occupations/occupations.module';
import { OccupationCronService } from './services/vacany.cron';
import { RetirementCron } from './services/retirement-cron';

@Module({
  imports: [OccupationModule],
  providers: [OccupationCronService, RetirementCron],
})
export class CronModule {}
