import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateOccupationDto } from '../../occupations/dto/create-occupations.dto';
import { Occupation } from '../../occupations/entities/occupations.entity';
import { CreateApartmentDto } from '../dto/create-apartment.dto';
import { Apartment } from '../entities/apartment.entity';

@Injectable()
export class ApartmentMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Apartment, CreateApartmentDto);
      createMap(mapper, CreateApartmentDto, Apartment);
      createMap(mapper, CreateOccupationDto, Occupation);
    };
  }
}
