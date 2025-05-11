import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CreateApplicationPriorityDto } from '../application-colonies/create-applications-priority.dto';

export class CreateApplicationDto {
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @AutoMap()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  employeeId: number;
  @Type(() => CreateApplicationPriorityDto)
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ApiProperty({
    isArray: true,
    type: CreateApplicationPriorityDto,
    example: [
      {
        colonyId: 1,
        priority: 1,
      },
    ],
  })
  colonyPriorities: CreateApplicationPriorityDto[];
  @AutoMap()
  createdById: number;
}
