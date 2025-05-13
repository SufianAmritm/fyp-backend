import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersModule } from '../managers/managers.module';
import { UserModule } from '../user/user.module';
import { ColonyController } from './colony.controller';
import { ColonyService } from './colony.service';
import { Colony } from './entities/colony.entity';
import { IColonyService } from './interfaces/colony.interface';
import { ColonyMappingProfile } from './mapping/colony.mapping';
import { ColonyRepository } from './repositories/colony.repository';
import { IColonyRepository } from './repositories/interface/colony-repository.interface';

const colonyEntities = [Colony];
const colonyRepositoryProvider = [
  {
    provide: IColonyRepository,
    useClass: ColonyRepository,
  },
];
const colonyServiceProvider = [
  {
    provide: IColonyService,
    useClass: ColonyService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(colonyEntities),
    UserModule,
    ManagersModule,
  ],
  controllers: [ColonyController],
  providers: [
    ...colonyServiceProvider,
    ...colonyRepositoryProvider,
    ColonyMappingProfile,
  ],
  exports: [...colonyServiceProvider],
})
export class ColonyModule {}
