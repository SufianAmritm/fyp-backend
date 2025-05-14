import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateApplicationPriorityDto {
  @AutoMap()
  applicationId: number;
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  colonyId: number;
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  priority: number;
}
