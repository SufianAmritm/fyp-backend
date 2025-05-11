import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateVacancyRequestDto {
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  apartmentId: number;

  @AutoMap()
  occupationId: number;
}
