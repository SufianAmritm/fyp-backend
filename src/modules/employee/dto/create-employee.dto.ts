import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { SignUpDto } from '../../auth/dto/sign-up.dto';

export class CreateEmployeeDto extends SignUpDto {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'razabad',
  })
  address?: string;
  @AutoMap()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  colonyId: number;
  @AutoMap()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsPositive()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
  })
  members?: number;
  @AutoMap()
  userId: number;
  @AutoMap()
  profileComplete: boolean;
  @AutoMap()
  createdById?: number;
  @AutoMap()
  picture?: string;
  @AutoMap()
  cnicFront: string;
  @AutoMap()
  cnicBack: string;
  @AutoMap()
  serviceCard: string;
}
