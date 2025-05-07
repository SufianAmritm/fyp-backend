import { OTP_TYPE } from '../../../common/constants/enums';
import { CreateOtpDto } from '../dto/create-otp.dto';
import { Otp } from '../entities/otp.entity';

export const IOtpService = Symbol('IOtpService');
export interface IOtpService {
  create(createOtpDto: CreateOtpDto): Promise<Otp>;
  verifyOtp(otp: string, type: OTP_TYPE): Promise<Otp>;
}
