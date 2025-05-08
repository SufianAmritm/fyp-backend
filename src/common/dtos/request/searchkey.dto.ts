import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchKeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: '',
  })
  search: string;
}
