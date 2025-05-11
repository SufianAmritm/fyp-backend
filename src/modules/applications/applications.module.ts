import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupationModule } from '../occupations/occupations.module';
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
  imports: [TypeOrmModule.forFeature(applicationsEntities), OccupationModule],
  controllers: [ApplicationController],
  providers: [
    ...applicationsServiceProvider,
    ...applicationsRepositoryProvider,
    ApplicationMappingProfile,
  ],
  exports: [...applicationsServiceProvider],
})
export class ApplicationModule {}
