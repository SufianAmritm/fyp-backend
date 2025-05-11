import { PartialType } from '@nestjs/swagger';
import { CreateApplicationPriorityDto } from './create-applications-priority.dto';
export class UpdateApplicationPriorityDto extends PartialType(
  CreateApplicationPriorityDto,
) {}
