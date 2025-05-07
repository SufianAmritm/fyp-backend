import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { IOtpService } from './interfaces/otp.interface';
import { OtpMappingProfile } from './mapping/otp.mapping';
import { OtpService } from './otp.service';
import { IOtpRepository } from './repositories/interface/otp-repository.interface';
import { OtpRepository } from './repositories/otp.repository';

const otpEntities = [Otp];
const otpRepositoryProvider = [
  {
    provide: IOtpRepository,
    useClass: OtpRepository,
  },
];
const otpServiceProvider = [
  {
    provide: IOtpService,
    useClass: OtpService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(otpEntities)],
  providers: [
    ...otpServiceProvider,
    ...otpRepositoryProvider,
    OtpMappingProfile,
  ],
  exports: [...otpServiceProvider],
})
export class OtpModule {}
