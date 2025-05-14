import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateTransferRequestDto } from './create-transfer-request.dto';
import { UpdateVacancyRequestByAdminDto } from './update-vacany-request.dto';

export class UpdateTransferRequestDto extends PartialType(
  CreateTransferRequestDto,
) {}
export class UpdateTransferRequestByAdminDto extends UpdateVacancyRequestByAdminDto {
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @ApiPropertyOptional({
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  apartmentId?: number;
}
