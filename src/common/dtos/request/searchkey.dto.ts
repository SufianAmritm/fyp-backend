import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: '',
  })
  @IsOptional()
  search: string;
}
