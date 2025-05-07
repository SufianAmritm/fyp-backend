import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { SignUpDto } from '../../auth/dto/sign-up.dto';

export class CreateManagersDto extends SignUpDto {
  @AutoMap()
  picture: string;
  @AutoMap()
  createdById: number;
  @AutoMap()
  userId: number;
  @AutoMap()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1,
  })
  stationId: number;
}
