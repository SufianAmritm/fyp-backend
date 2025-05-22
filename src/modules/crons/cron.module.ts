import { Module } from '@nestjs/common';
import { OccupationModule } from '../occupations/occupations.module';
import { OccupationCronService } from './services/vacany.cron';

@Module({
  imports: [OccupationModule],
  providers: [OccupationCronService],
})
export class CronModule {}
