import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { SearchKeyDto } from '../../../common/dtos/request/searchkey.dto';

export class GetEmployeeDto extends SearchKeyDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
  })
  stationId: number;
}
