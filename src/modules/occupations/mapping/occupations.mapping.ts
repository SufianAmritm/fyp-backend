import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateOccupationDto } from '../dto/create-occupations.dto';
import { CreateTransferRequestDto } from '../dto/create-transfer-request.dto';
import { CreateVacancyRequestDto } from '../dto/create-vacancy-request.dto';
import {
  UpdateVacancyRequestByAdminDto,
  UpdateVacancyRequestDto,
} from '../dto/update-vacany-request.dto';
import {
  UpdateTransferRequestByAdminDto,
  UpdateTransferRequestDto,
} from '../dto/updateTransferRequest.dto';
import { Occupation } from '../entities/occupations.entity';
import { TransferRequest } from '../entities/transfer-requests.entity';
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
      createMap(mapper, UpdateVacancyRequestByAdminDto, VacancyRequest);
      createMap(mapper, CreateTransferRequestDto, TransferRequest);
      createMap(mapper, UpdateTransferRequestDto, TransferRequest);
      createMap(mapper, UpdateTransferRequestByAdminDto, TransferRequest);

      createMap(mapper, CreateOccupationDto, Occupation);
    };
  }
}
