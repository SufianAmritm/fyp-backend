import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDivisionDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Lahore',
  })
  name: string;
  @AutoMap()
  createdById: number;
  @AutoMap()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'Lahore Cantonment Station',
  })
  @IsOptional()
  description: string;
}
