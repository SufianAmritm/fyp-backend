import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { DUMMY_DATA } from 'src/common/constants';

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'Please provide a valid email address',
    example: `${DUMMY_DATA.email}`,
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
