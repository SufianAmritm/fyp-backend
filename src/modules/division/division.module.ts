import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { Division } from './entities/division.entity';
import { IDivisionService } from './interfaces/division.interface';
import { DivisionMappingProfile } from './mapping/division.mapping';
import { DivisionRepository } from './repositories/division.repository';
import { IDivisionRepository } from './repositories/interface/division-repository.interface';

const divisionEntities = [Division];
const divisionRepositoryProvider = [
  {
    provide: IDivisionRepository,
    useClass: DivisionRepository,
  },
];
const divisionServiceProvider = [
  {
    provide: IDivisionService,
    useClass: DivisionService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(divisionEntities)],
  controllers: [DivisionController],
  providers: [
    ...divisionServiceProvider,
    ...divisionRepositoryProvider,
    DivisionMappingProfile,
    DbTransactionFactory,
  ],
  exports: [...divisionServiceProvider, ...divisionRepositoryProvider],
})
export class DivisionModule {}
