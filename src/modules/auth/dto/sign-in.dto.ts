import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { DUMMY_DATA } from 'src/common/constants';

export class SignInDto {
  @ApiProperty({
    description: 'Please provide email',
    example: `${DUMMY_DATA.email}`,
  })
  @IsString({ message: 'email should be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  @Transform(({value})=>value.toLowerCase())
  email: string;

  @ApiProperty({
    description: 'Please provide a strong password',
    example: `${DUMMY_DATA.password}`,
  })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;
}
