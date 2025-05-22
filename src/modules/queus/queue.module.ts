import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUES } from '../../common/constants';
import { DashboardModule } from '../dashboard/dashboard.module';
import { CsvProcessor } from './processor/csv-processor';
import { ReportProcessor } from './processor/report-processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUES.CSV.NAME,
        defaultJobOptions: {
          delay: 5000,
          removeOnFail: false,
          removeOnComplete: true,
          backoff: {
            delay: 5000,
            type: 'exponential',
          },

          attempts: Number.MAX_SAFE_INTEGER,
        },
      },
      {
        name: QUEUES.REPORT.NAME,
        defaultJobOptions: {
          delay: 5000,
          removeOnFail: false,
          removeOnComplete: true,
          backoff: {
            delay: 5000,
            type: 'exponential',
          },

          attempts: Number.MAX_SAFE_INTEGER,
        },
      },
    ),
    DashboardModule,
  ],
  providers: [CsvProcessor, ReportProcessor],
})
export class QueueModule {}
