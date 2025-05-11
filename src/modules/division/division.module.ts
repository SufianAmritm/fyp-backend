import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Division } from './entities/division.entity';
import { IDivisionService } from './interfaces/division.interface';
import { DivisionMappingProfile } from './mapping/division.mapping';
import { DivisionController } from './division.controller';
import { IDivisionRepository } from './repositories/interface/division-repository.interface';
import { DivisionRepository } from './repositories/division.repository';
import { DivisionService } from './division.service';

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
  ],
  exports: [...divisionServiceProvider],
})
export class DivisionModule {}