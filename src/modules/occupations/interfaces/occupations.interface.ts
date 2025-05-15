import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { PagedList } from '../../../common/types/paged-list';
import { AssignOccupationDto } from '../dto/assign-occupation.dto';
import { CreateTransferRequestDto } from '../dto/create-transfer-request.dto';
import { GetTransferRequestDto } from '../dto/get-transfer-requests.dto';
import { GetVacancyRequestDto } from '../dto/get-vacany-requests.dto';
import { UpdateVacancyRequestByAdminDto } from '../dto/update-vacany-request.dto';
import {
  UpdateTransferRequestByAdminDto,
  UpdateTransferRequestDto,
} from '../dto/updateTransferRequest.dto';
import { Occupation } from '../entities/occupations.entity';
import { TransferRequest } from '../entities/transfer-requests.entity';
import { VacancyRequest } from '../entities/vacancy-requests.entity';

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
  findOneTransferRequest(id: number): Promise<TransferRequest>;
  findAllTransferRequest(
    getDto: GetTransferRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<TransferRequest>>;
  findAllForCronJob(days: Date): Promise<Occupation[]>;
  findOneVacancyRequest(id: number): Promise<VacancyRequest>;
  findAllVacancyRequest(
    getDto: GetVacancyRequestDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  ): Promise<PagedList<VacancyRequest>>;
  bulkUpdate(updates: QueryDeepPartialEntity<Occupation>[]);
  findMyVacancyRequests(userId: number): Promise<VacancyRequest[]>;
  findMyTransferRequests(userId: number): Promise<TransferRequest[]>;
}
