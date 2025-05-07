import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { DUMMY_DATA } from 'src/common/constants';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Please provide a valid email address verification token',
    example: `${DUMMY_DATA.token}`,
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  tenantId?: number;

  @ApiProperty({
    description: 'Please provide a strong password',
    example: `${DUMMY_DATA.password}`,
  })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;

  email?: string;
}
