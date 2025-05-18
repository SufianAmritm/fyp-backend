import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVacancyRequestDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'reason',
  })
  reason: string;
}
