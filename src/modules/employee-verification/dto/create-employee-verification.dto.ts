import { AutoMap } from '@automapper/classes';

export class CreateEmployeeVerificationDto {
  @AutoMap()
  employeeId: number;

  @AutoMap()
  createdById: number;
}
