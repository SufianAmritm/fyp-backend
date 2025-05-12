import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransferRequestDto {
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  toColonyId: number;
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  fromColonyId: number;
  @AutoMap()
  createdById: number;
}
