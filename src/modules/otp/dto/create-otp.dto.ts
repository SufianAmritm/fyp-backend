import { AutoMap } from '@automapper/classes';
import { OTP_TYPE } from '../../../common/constants/enums';

export class CreateOtpDto {
  @AutoMap()
  userId: number;

  @AutoMap()
  otp: string;

  @AutoMap()
  expireTimestamp: bigint;

  @AutoMap()
  type: OTP_TYPE;

}
