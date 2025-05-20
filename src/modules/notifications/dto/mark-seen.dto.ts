import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class MarkSeenDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  @ApiProperty({
    example: [1],
  })
  notificationIds: number[];
  @AutoMap()
  userId: number;
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: new Date(),
  })
  withDate?: Date;
}
