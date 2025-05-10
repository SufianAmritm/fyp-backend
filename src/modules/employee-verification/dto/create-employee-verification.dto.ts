import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';

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
  status: EMPLOYEE_VERIFICATION_STATUS = EMPLOYEE_VERIFICATION_STATUS.PENDING;
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255, {
    message: 'Reason must be less than 255 characters',
  })
  @ApiPropertyOptional({})
  reason: string;
  @AutoMap()
  createdById: number;
}
