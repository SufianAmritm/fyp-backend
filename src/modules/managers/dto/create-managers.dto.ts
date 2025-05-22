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

export class CreateManagersDto extends OmitType(SignUpDto, ['password']) {
  @AutoMap()
  picture: string;

  @AutoMap()
  createdById: number;

  @AutoMap()
  userId: number;

  @AutoMap()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  stationId: number;
  @AutoMap()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @ApiProperty({
    example: new Date(),
  })
  retirementDate: Date;
  @AutoMap()
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;
}
