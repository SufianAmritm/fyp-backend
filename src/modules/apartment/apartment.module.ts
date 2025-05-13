import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbTransactionFactory } from '../../common/database/utils/db-transaction-factory';
import { ManagersModule } from '../managers/managers.module';
import { UserModule } from '../user/user.module';
import { ApartmentController } from './apartment.controller';
import { ApartmentService } from './apartment.service';
import { Apartment } from './entities/apartment.entity';
import { IApartmentService } from './interfaces/apartment.interface';
import { ApartmentMappingProfile } from './mapping/apartment.mapping';
import { ApartmentRepository } from './repositories/apartment.repository';
import { IApartmentRepository } from './repositories/interface/apartment-repository.interface';

const apartmentEntities = [Apartment];
const apartmentRepositoryProvider = [
  {
    provide: IApartmentRepository,
    useClass: ApartmentRepository,
  },
];
const apartmentServiceProvider = [
  {
    provide: IApartmentService,
    useClass: ApartmentService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature(apartmentEntities),
    UserModule,
    ManagersModule,
  ],
  controllers: [ApartmentController],
  providers: [
    ...apartmentServiceProvider,
    ...apartmentRepositoryProvider,
    ApartmentMappingProfile,
    DbTransactionFactory,
  ],
  exports: [...apartmentServiceProvider],
})
export class ApartmentModule {}
