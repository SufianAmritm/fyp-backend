import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsModule } from '../aws/aws.module';
import { UserModule } from '../user/user.module';
import { Manager } from './entities/managers.entity';
import { IManagersService } from './interfaces/managers.interface';
import { ManagersController } from './managers.controller';
import { ManagersService } from './managers.service';
import { ManagersMappingProfile } from './mapping/managers.mapping';
import { IManagersRepository } from './repositories/interface/managers-repository.interface';
import { ManagersRepository } from './repositories/managers.repository';
import { NotificationModule } from '../notifications/notification.module';
import { EventsModule } from '../events/events.module';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';

const managersEntities = [Manager];
const managersRepositoryProvider = [
  {
    provide: IManagersRepository,
    useClass: ManagersRepository,
  },
];
const managersServiceProvider = [
  {
    provide: IManagersService,
    useClass: ManagersService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(managersEntities),
    AwsModule,
    UserModule,
    NotificationModule,
    EventsModule,
  ],
  controllers: [ManagersController],
  providers: [
    ...managersServiceProvider,
    ...managersRepositoryProvider,
    ManagersMappingProfile,
    DbTransactionFactory,
  ],
  exports: [...managersServiceProvider, ...managersRepositoryProvider],
})
export class ManagersModule {}
