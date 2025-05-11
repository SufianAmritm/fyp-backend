import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateEmployeeVerificationDto } from './create-employee-verification.dto';
export class UpdateEmployeeVerificationDto extends PartialType(
  CreateEmployeeVerificationDto,
) {
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason: string;
}
