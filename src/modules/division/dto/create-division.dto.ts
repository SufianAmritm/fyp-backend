import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDivisionDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Lahore',
  })
  name: string;
}
