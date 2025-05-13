import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { EmployeeModule } from '../employee/employee.module';
import { UserModule } from '../user/user.module';
import { Occupation } from './entities/occupations.entity';
import { TransferRequest } from './entities/transfer-requests.entity';
import { VacancyRequest } from './entities/vacancy-requests.entity';
import { IOccupationService } from './interfaces/occupations.interface';
import { OccupationMappingProfile } from './mapping/occupations.mapping';
import { OccupationController } from './occupations.controller';
import { OccupationService } from './occupations.service';
import { IOccupationRepository } from './repositories/interface/occupations-repository.interface';
import { ITransferRequestRepository } from './repositories/interface/transfer-request-repository.interface';
import { IVacancyRequestRepository } from './repositories/interface/vacancy-requests-repository.interface';
import { OccupationRepository } from './repositories/occupations.repository';
import { TransferRequestRepository } from './repositories/transfer-request.repository';
import { VacancyRequestRepository } from './repositories/vacany-request.repository';
import { ManagersModule } from '../managers/managers.module';

const occupationsEntities = [Occupation, VacancyRequest, TransferRequest];
const occupationsRepositoryProvider = [
  {
    provide: IOccupationRepository,
    useClass: OccupationRepository,
  },
  {
    provide: IVacancyRequestRepository,
    useClass: VacancyRequestRepository,
  },
  {
    provide: ITransferRequestRepository,
    useClass: TransferRequestRepository,
  },
];
const occupationsServiceProvider = [
  {
    provide: IOccupationService,
    useClass: OccupationService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(occupationsEntities),
    UserModule,
    EmployeeModule,
    ManagersModule,
  ],
  controllers: [OccupationController],
  providers: [
    ...occupationsServiceProvider,
    ...occupationsRepositoryProvider,
    OccupationMappingProfile,
    DbTransactionFactory,
  ],
  exports: [...occupationsServiceProvider],
})
export class OccupationModule {}
