import {
  AssignOccupationDto,
  DeAssignOccupationDto,
} from '../dto/assign-occupation.dto';
import { Occupation } from '../entities/occupations.entity';

export const IOccupationService = Symbol('IOccupationService');
export interface IOccupationService {
  assignOccupation(
    assignOccupationDto: AssignOccupationDto,
    userId: number,
  ): Promise<any>;
  deAssignOccupation(
    deAssignOccupationDto: DeAssignOccupationDto,
    userId: number,
  ): Promise<any>;
  findOne(id: number): Promise<Occupation>;
  findOneByApartmentId(id: number): Promise<Occupation>;
}
