import { PartialType } from '@nestjs/swagger';
import { CreateColonyDto } from './create-colony.dto';
export class UpdateColonyDto extends PartialType(CreateColonyDto) {}