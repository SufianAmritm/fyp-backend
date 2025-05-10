import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRolePermissionDto {
  @AutoMap()
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  component: string;

  @AutoMap()
  @ApiProperty({})
  @IsBoolean()
  @IsNotEmpty()
  canAccess: boolean;

  @AutoMap()
  @ApiProperty({})
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
