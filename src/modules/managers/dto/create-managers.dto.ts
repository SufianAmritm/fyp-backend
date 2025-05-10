import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { SignUpDto } from '../../auth/dto/sign-up.dto';
import { Transform } from 'class-transformer';

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
  @ApiPropertyOptional({})
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;
}
