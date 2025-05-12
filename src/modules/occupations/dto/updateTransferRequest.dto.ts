import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTransferRequestDto } from './create-transfer-request.dto';
import { UpdateVacancyRequestByAdminDto } from './update-vacany-request.dto';
import { AutoMap } from '@automapper/classes';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
  apartmentId: number;
}
