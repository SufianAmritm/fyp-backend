import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../../common/constants/enums';
import { CreateApplicationDto } from './create-applications.dto';
import { Transform } from 'class-transformer';
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}

export class UpdateApplicationByAdminDto {
  @AutoMap()
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
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
