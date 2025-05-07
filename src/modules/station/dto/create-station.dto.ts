import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

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
  createdById: number;
}
