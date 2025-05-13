import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../../common/constants/enums';
import { CreateApplicationDto } from './create-applications.dto';
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class UpdateApplicationByAdminDto {
  @AutoMap()
  @ApiProperty({
    example: 'reason',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
  @AutoMap()
  status: EMPLOYEE_VERIFICATION_STATUS;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @ApiPropertyOptional({
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  apartmentId: number;
}
