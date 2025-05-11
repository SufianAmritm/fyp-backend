import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-applications.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../../common/constants/enums';
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
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
