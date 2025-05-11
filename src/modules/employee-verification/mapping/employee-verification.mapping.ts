import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateEmployeeVerificationDto } from '../dto/create-employee-verification.dto';
import { UpdateEmployeeVerificationDto } from '../dto/update-employee-verification.dto';
import { EmployeeVerification } from '../entities/employee-verification.entity';

@Injectable()
export class EmployeeVerificationMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, EmployeeVerification, CreateEmployeeVerificationDto);
      createMap(mapper, CreateEmployeeVerificationDto, EmployeeVerification);
      createMap(mapper, UpdateEmployeeVerificationDto, EmployeeVerification);
    };
  }
}
