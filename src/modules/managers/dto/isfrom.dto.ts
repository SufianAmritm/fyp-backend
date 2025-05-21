import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class IsFromDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  fromColonyId: number;
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  toColonyId: number;
}
