import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { CreateEmployeeVerificationDto } from './create-employee-verification.dto';
export class UpdateEmployeeVerificationDto extends PartialType(
  CreateEmployeeVerificationDto,
) {}

export class UpdateEmployeeVerificationByAdminDto {
  @AutoMap()
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason: string;
  @AutoMap()
  status: EMPLOYEE_VERIFICATION_STATUS;
}
