import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLogService } from './app-log.service';
import { AppLog } from './entities/app-log.entity';
import { IAppLogService } from './interfaces/app-log.interface';
import { AppLogMappingProfile } from './mapping/app-log.mapping';
import { AppLogRepository } from './repositories/app-log.repository';
import { IAppLogRepository } from './repositories/interface/app-log-repository.interface';

const appLogEntities = [AppLog];
const appLogRepositoryProvider = [
  {
    provide: IAppLogRepository,
    useClass: AppLogRepository,
  },
];
const appLogServiceProvider = [
  {
    provide: IAppLogService,
    useClass: AppLogService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(appLogEntities)],
  providers: [
    ...appLogServiceProvider,
    ...appLogRepositoryProvider,
    AppLogMappingProfile,
  ],
  exports: [...appLogServiceProvider],
})
export class AppLogModule {}
