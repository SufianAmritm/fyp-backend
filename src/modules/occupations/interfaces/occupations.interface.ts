import { AssignOccupationDto } from '../dto/assign-occupation.dto';
import { CreateVacancyRequestDto } from '../dto/create-vacancy-request.dto';
import { UpdateVacancyRequestDto } from '../dto/update-vacany-request.dto';
import { Occupation } from '../entities/occupations.entity';

export const IOccupationService = Symbol('IOccupationService');
export interface IOccupationService {
  assignOccupation(
    id: number,
    assignOccupationDto: AssignOccupationDto,
    userId: number,
  ): Promise<any>;
  deAssignOccupation(id: number, userId: number): Promise<any>;
  findOne(id: number): Promise<Occupation>;
  findOneByApartmentId(id: number): Promise<Occupation>;
  findOneByOccupiedById(id: number): Promise<Occupation>;

  vacantOccupation(
    createVacancyRequest: CreateVacancyRequestDto,
    userId: number,
  );
  updateVacancyRequest(
    id: number,
    updateVacancyRequestDto: UpdateVacancyRequestDto,
    userId: number,
  );
  leaveOccupation(id: number, userId: number);
}
