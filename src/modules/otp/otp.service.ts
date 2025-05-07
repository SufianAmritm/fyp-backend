import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { OTP_TYPE } from '../../common/constants/enums';
import { APP_ERROR_MESSAGES } from '../../common/constants/errors';
import { FindOptionsBuilder } from '../../common/database/builder-pattern/find-options.builder';
import { CreateOtpDto } from './dto/create-otp.dto';
import { Otp } from './entities/otp.entity';
import { IOtpService } from './interfaces/otp.interface';
import { IOtpRepository } from './repositories/interface/otp-repository.interface';

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    @Inject(IOtpRepository)
    private readonly otpRepository: IOtpRepository,
    @InjectMapper() private readonly otpMapper: Mapper,
  ) {}

  async create(createOtpDto: CreateOtpDto) {
    const { userId, type } = createOtpDto;
    const currentTimeStamp = Date.now();
    const previousTries = await this.otpRepository.find({
      userId,
      type,
      isUsed: false,
      expireTimestamp: MoreThanOrEqual(BigInt(currentTimeStamp)),
    });
    if (previousTries.length >= 3) {
      throw new BadRequestException({
        message: APP_ERROR_MESSAGES.OTP_LIMITED_EXCEEDED,
        statusCode: 'otp_limit_exceeded',
      });
    }

    const newOtp = this.otpMapper.map(createOtpDto, CreateOtpDto, Otp);
    return this.otpRepository.create(newOtp);
  }

  async verifyOtp(otp: string, type: OTP_TYPE): Promise<Otp> {
    const findOptions = new FindOptionsBuilder<Otp>()
      .where({ otp, isUsed: false, type })
      .relations({
        user: {
          role: true,
        },
      })
      .build();
    const otpData =
      await this.otpRepository.findOneWithBuilderOption(findOptions);

    if (!otpData) {
      return undefined;
    }
    if (otpData.expireTimestamp < Date.now()) {
      throw new BadRequestException({
        statusCode: 'otp_expired',
        message: APP_ERROR_MESSAGES.OTP_EXPIRED,
      });
    }

    otpData.isUsed = true;
    otpData.usedAt = new Date();
    await this.otpRepository.update({ id: otpData.id }, otpData);
    return otpData;
  }
}
