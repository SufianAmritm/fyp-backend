import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colony } from './entities/colony.entity';
import { IColonyService } from './interfaces/colony.interface';
import { ColonyMappingProfile } from './mapping/colony.mapping';
import { ColonyController } from './colony.controller';
import { IColonyRepository } from './repositories/interface/colony-repository.interface';
import { ColonyRepository } from './repositories/colony.repository';
import { ColonyService } from './colony.service';

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
  imports: [TypeOrmModule.forFeature(colonyEntities)],
  controllers: [ColonyController],
  providers: [
    ...colonyServiceProvider,
    ...colonyRepositoryProvider,
    ColonyMappingProfile,
  ],
  exports: [...colonyServiceProvider],
})
export class ColonyModule {}