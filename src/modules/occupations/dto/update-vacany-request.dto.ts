import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';

export class UpdateVacancyRequestDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsEnum(EMPLOYEE_VERIFICATION_STATUS, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: EMPLOYEE_VERIFICATION_STATUS.APPROVED,
    enum: EMPLOYEE_VERIFICATION_STATUS,
  })
  status: EMPLOYEE_VERIFICATION_STATUS;
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'reason',
  })
  reason: string;
}
