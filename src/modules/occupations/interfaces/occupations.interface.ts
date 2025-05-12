import { AssignOccupationDto } from '../dto/assign-occupation.dto';
import { CreateTransferRequestDto } from '../dto/create-transfer-request.dto';
import { UpdateVacancyRequestByAdminDto } from '../dto/update-vacany-request.dto';
import { UpdateTransferRequestDto, UpdateTransferRequestByAdminDto } from '../dto/updateTransferRequest.dto';
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

  vacantOccupation(userId: number);
  updateVacancyRequest(
    id: number,
    updateVacancyRequestDto: UpdateVacancyRequestByAdminDto,
    userId: number,
  );
  updateTransferRequestByAdmin(
    id: number,
    updateTransferRequestByAdminDto: UpdateTransferRequestByAdminDto,
    userId: number,
  );
  leaveOccupation(id: number, userId: number);
  cancelVacancyRequest(id: number, userId: number);
  createTransferRequest(
    createTransferRequestDto: CreateTransferRequestDto,
    userId: number,
  );
  cancelTransferRequest(id: number, userId: number);
  updateTransferRequest(
    id: number,
    updateTransferRequestDto: UpdateTransferRequestDto,
    userId: number,
  );
}
