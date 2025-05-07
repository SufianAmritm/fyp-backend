import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateSettingsDto {

  @AutoMap()
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  enableSuggestions: boolean;
userId:number
}
