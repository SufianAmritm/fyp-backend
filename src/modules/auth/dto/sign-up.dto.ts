import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { DUMMY_DATA } from 'src/common/constants';

export class SignUpDto {
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
  @ApiProperty({
    description: 'Please provide email',
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsString({ message: 'email should be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  email: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  @Matches(/^\+923[0-9]{9}$/, {
    message:
      'The phone number should be a valid Pakistani phone number with format +923xxxxxxxxx',
  })
  phoneNumber: string;
}

export class AddUserDto extends SignUpDto {}
