import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { CreateEmployeeVerificationDto } from './create-employee-verification.dto';
export class UpdateEmployeeVerificationDto extends PartialType(
  CreateEmployeeVerificationDto,
) {}

export class UpdateEmployeeVerificationByAdminDto {
  @AutoMap()
  @ApiProperty({
    example: 'reason',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason: string;
  @AutoMap()
  status: EMPLOYEE_VERIFICATION_STATUS;
}
