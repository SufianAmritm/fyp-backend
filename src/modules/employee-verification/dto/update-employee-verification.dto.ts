import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateEmployeeVerificationDto } from './create-employee-verification.dto';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
export class UpdateEmployeeVerificationDto extends PartialType(
  CreateEmployeeVerificationDto,
) {
  @AutoMap()
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason: string;
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  @AutoMap()
  status: EMPLOYEE_VERIFICATION_STATUS;
}
