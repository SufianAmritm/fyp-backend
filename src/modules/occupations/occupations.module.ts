import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Occupation } from './entities/occupations.entity';
import { IOccupationService } from './interfaces/occupations.interface';
import { OccupationMappingProfile } from './mapping/occupations.mapping';
import { OccupationController } from './occupations.controller';
import { IOccupationRepository } from './repositories/interface/occupations-repository.interface';
import { OccupationRepository } from './repositories/occupations.repository';
import { OccupationService } from './occupations.service';

const occupationsEntities = [Occupation];
const occupationsRepositoryProvider = [
  {
    provide: IOccupationRepository,
    useClass: OccupationRepository,
  },
];
const occupationsServiceProvider = [
  {
    provide: IOccupationService,
    useClass: OccupationService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(occupationsEntities)],
  controllers: [OccupationController],
  providers: [
    ...occupationsServiceProvider,
    ...occupationsRepositoryProvider,
    OccupationMappingProfile,
  ],
  exports: [...occupationsServiceProvider],
})
export class OccupationModule {}
