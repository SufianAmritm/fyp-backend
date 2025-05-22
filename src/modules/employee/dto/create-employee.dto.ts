import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { SignUpDto } from '../../auth/dto/sign-up.dto';

export class CreateEmployeeDto extends OmitType(SignUpDto, ['password']) {
  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'razabad',
  })
  address?: string;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  colonyId: number;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
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

  @AutoMap()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  retirementDate: Date;

  @AutoMap()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  serviceNumber: string;
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  yearsOfService: number;
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  grade: number;
  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  yearOfInduction: number;
}
