import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateOccupationDto } from '../dto/create-occupations.dto';
import { CreateVacancyRequestDto } from '../dto/create-vacancy-request.dto';
import { UpdateVacancyRequestDto } from '../dto/update-vacany-request.dto';
import { Occupation } from '../entities/occupations.entity';
import { VacancyRequest } from '../entities/vacancy-requests.entity';

@Injectable()
export class OccupationMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Occupation, CreateOccupationDto);
      createMap(mapper, CreateVacancyRequestDto, VacancyRequest);
      createMap(mapper, UpdateVacancyRequestDto, VacancyRequest);

      createMap(mapper, CreateOccupationDto, Occupation);
    };
  }
}
