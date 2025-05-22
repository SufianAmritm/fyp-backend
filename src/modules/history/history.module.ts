import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { IHistoryService } from './interfaces/history.interface';
import { HistoryMappingProfile } from './mapping/history.mapping';
import { HistoryRepository } from './repositories/history.repository';
import { IHistoryRepository } from './repositories/interface/history-repository.interface';

const historyEntities = [History];
const historyRepositoryProvider = [
  {
    provide: IHistoryRepository,
    useClass: HistoryRepository,
  },
];
const historyServiceProvider = [
  {
    provide: IHistoryService,
    useClass: HistoryService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(historyEntities)],
  controllers: [HistoryController],
  providers: [
    ...historyServiceProvider,
    ...historyRepositoryProvider,
    HistoryMappingProfile,
  ],
  exports: [...historyServiceProvider, ...historyRepositoryProvider],
})
export class HistoryModule {}
