import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignOccupationDto {
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  employeeId: number;
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  apartmentId: number;
}

export class DeAssignOccupationDto {
  @AutoMap()
  @ApiProperty({
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsNotEmpty()
  apartmentId: number;
}
