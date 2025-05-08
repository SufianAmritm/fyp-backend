import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateStationDto {
  @AutoMap()
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  divisionId: number;

  @AutoMap()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Lahore Cantonment Station',
  })
  name: string;
  @AutoMap()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 'Lahore Cantonment Station',
  })
  @IsOptional()
  description: string;

  @AutoMap()
  createdById: number;
}
