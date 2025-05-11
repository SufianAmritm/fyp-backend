import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../../common/constants/enums';
import { CreateApplicationDto } from './create-applications.dto';
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

  @AutoMap()
  @ApiPropertyOptional({
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  apartmentId: number;
}
