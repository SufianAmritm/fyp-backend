import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { DUMMY_DATA } from '../../../common/constants';

export class CreateUserDto {
  @ApiProperty()
  @AutoMap()
  @IsString()
  @Matches(/^\+923[0-9]{9}$/, {
    message:
      'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
  })
  phoneNumber: string;
  @AutoMap()
  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  name: string;

  @AutoMap()
  @ApiProperty({
    description: 'Please provide a strong password',
    example: `${DUMMY_DATA.password}`,
  })
  @IsString({ message: 'Password should be a string' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password should be at least 6 characters long' })
  password: string;
  @AutoMap()
  emailVerified: boolean;
}
