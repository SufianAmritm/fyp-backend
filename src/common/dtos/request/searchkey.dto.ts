import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ORDER_BY } from '../../constants/enums';

export class SearchKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  search: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ORDER_BY)
  @ApiPropertyOptional({
    example: '',
    enum: ORDER_BY,
  })
  @IsOptional()
  orderBy: ORDER_BY = ORDER_BY.DESC;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'createdAt',
  })
  @IsOptional()
  sortBy: string = 'createdAt';
}
