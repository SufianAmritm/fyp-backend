import { PartialType } from '@nestjs/swagger';
import { CreateOccupationDto } from './create-occupations.dto';
export class UpdateOccupationDto extends PartialType(CreateOccupationDto) {}
