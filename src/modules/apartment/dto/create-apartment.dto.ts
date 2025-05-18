import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateApartmentDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '40',
  })
  houseNo: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '40',
  })
  streetNo: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'razabad 40',
  })
  address: string;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'razabad 40',
  })
  @IsOptional()
  description: string;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  colonyId: number;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  rooms: number;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  bathrooms: number;

  @AutoMap()
  createdById: number;
}
