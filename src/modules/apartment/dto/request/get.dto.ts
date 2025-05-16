import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OCCUPATION_STATUS } from '../../../../common/constants/enums';
import { SearchKeyDto } from '../../../../common/dtos/request/searchkey.dto';

export class GetApartmentDto extends SearchKeyDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 1,
  })
  colonyId: number;
  @IsOptional()
  @Transform(({ value }) => value.split(',').map(Number))
  @IsInt({
    each: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: [1],
  })
  colonyIds: number[];
  @IsOptional()
  @IsEnum(OCCUPATION_STATUS)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: OCCUPATION_STATUS.VACANT,
  })
  status: OCCUPATION_STATUS;
}
