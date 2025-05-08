import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
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
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'razabad',
  })
  address?: string;
  @AutoMap()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
  })
  colonyId: number;
  @AutoMap()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
  })
  members?: number;
  @AutoMap()
  picture: string;
  @AutoMap()
  cnicFront: string;
  @AutoMap()
  cnicBack: string;
  @AutoMap()
  serviceCard: string;
  @AutoMap()
  emailVerified: boolean;
}
