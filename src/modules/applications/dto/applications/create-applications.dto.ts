import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateApplicationPriorityDto } from '../application-colonies/create-applications-priority.dto';

export class CreateApplicationDto {
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
