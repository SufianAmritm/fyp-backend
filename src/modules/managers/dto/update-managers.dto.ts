import { PartialType } from '@nestjs/swagger';
import { CreateManagersDto } from './create-managers.dto';
export class UpdateManagersDto extends PartialType(CreateManagersDto) {}