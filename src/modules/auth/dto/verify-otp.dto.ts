import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DUMMY_DATA } from '../../../common/constants';
import { OTP_TYPE } from '../../../common/constants/enums';

export class VerifyOtpDto {
  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  @MinLength(6)
  otp: string;
  @ApiProperty({
    example: OTP_TYPE.REGISTRATION,
  })
  @IsEnum(OTP_TYPE)
  @IsString()
  @IsNotEmpty()
  type: OTP_TYPE;
}
export class SendOtpDto extends OmitType(VerifyOtpDto, ['otp']) {
  @ApiProperty({
    description: 'Please provide email',
    example: `${DUMMY_DATA.email}`,
  })
  @IsString({ message: 'email should be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}
