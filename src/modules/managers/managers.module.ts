import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Managers } from './entities/managers.entity';
import { IManagersService } from './interfaces/managers.interface';
import { ManagersMappingProfile } from './mapping/managers.mapping';
import { ManagersController } from './managers.controller';
import { IManagersRepository } from './repositories/interface/managers-repository.interface';
import { ManagersRepository } from './repositories/managers.repository';
import { ManagersService } from './managers.service';

const managersEntities = [Managers];
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
  imports: [TypeOrmModule.forFeature(managersEntities)],
  controllers: [ManagersController],
  providers: [
    ...managersServiceProvider,
    ...managersRepositoryProvider,
    ManagersMappingProfile,
  ],
  exports: [...managersServiceProvider],
})
export class ManagersModule {}