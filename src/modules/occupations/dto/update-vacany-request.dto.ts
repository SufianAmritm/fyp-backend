import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_VERIFICATION_STATUS } from '../../../common/constants/enums';
import { CreateVacancyRequestDto } from './create-vacancy-request.dto';

export class UpdateVacancyRequestDto extends PartialType(
  CreateVacancyRequestDto,
) {}
export class UpdateVacancyRequestByAdminDto {
  @AutoMap()
  status: EMPLOYEE_VERIFICATION_STATUS;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'reason',
  })
  @IsOptional()
  reason: string;
}
