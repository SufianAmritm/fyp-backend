import {
  createMap,
  Mapper,
  MappingProfile
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateOtpDto } from '../dto/create-otp.dto';
import { Otp } from '../entities/otp.entity';

@Injectable()
export class OtpMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Otp, CreateOtpDto);
      createMap(
        mapper,
        CreateOtpDto,
        Otp,
      );
    };
  }
}
