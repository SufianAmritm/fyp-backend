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

export class CreateColonyDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'colony',
  })
  name: string;
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'colony',
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
  stationId: number;
  @AutoMap()
  createdById: number;
}
