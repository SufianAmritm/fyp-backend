import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeVerificationDto } from './create-employee-verification.dto';
export class UpdateEmployeeVerificationDto extends PartialType(CreateEmployeeVerificationDto) {}