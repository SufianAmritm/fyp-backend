import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { SearchKeyDto } from '../../../../common/dtos/request/searchkey.dto';
import { Transform } from 'class-transformer';

export class GetColonyDto extends SearchKeyDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({
    example: 1,
  })
  stationId: number;
}
