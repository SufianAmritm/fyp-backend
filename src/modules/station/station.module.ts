import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station } from './entities/station.entity';
import { IStationService } from './interfaces/station.interface';
import { StationMappingProfile } from './mapping/station.mapping';
import { StationController } from './station.controller';
import { IStationRepository } from './repositories/interface/station-repository.interface';
import { StationRepository } from './repositories/station.repository';
import { StationService } from './station.service';

const stationEntities = [Station];
const stationRepositoryProvider = [
  {
    provide: IStationRepository,
    useClass: StationRepository,
  },
];
const stationServiceProvider = [
  {
    provide: IStationService,
    useClass: StationService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(stationEntities)],
  controllers: [StationController],
  providers: [
    ...stationServiceProvider,
    ...stationRepositoryProvider,
    StationMappingProfile,
  ],
  exports: [...stationServiceProvider],
})
export class StationModule {}