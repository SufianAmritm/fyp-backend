import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apartment } from './entities/apartment.entity';
import { IApartmentService } from './interfaces/apartment.interface';
import { ApartmentMappingProfile } from './mapping/apartment.mapping';
import { ApartmentController } from './apartment.controller';
import { IApartmentRepository } from './repositories/interface/apartment-repository.interface';
import { ApartmentRepository } from './repositories/apartment.repository';
import { ApartmentService } from './apartment.service';

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
  imports: [TypeOrmModule.forFeature(apartmentEntities)],
  controllers: [ApartmentController],
  providers: [
    ...apartmentServiceProvider,
    ...apartmentRepositoryProvider,
    ApartmentMappingProfile,
  ],
  exports: [...apartmentServiceProvider],
})
export class ApartmentModule {}