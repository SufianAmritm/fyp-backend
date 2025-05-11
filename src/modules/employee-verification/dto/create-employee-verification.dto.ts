import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeVerificationDto {
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  employeeId: number;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255, {
    message: 'Reason must be less than 255 characters',
  })
  @AutoMap()
  createdById: number;
}
