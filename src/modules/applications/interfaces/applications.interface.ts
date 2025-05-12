import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateApplicationDto } from '../dto/applications/create-applications.dto';
import {
  UpdateApplicationByAdminDto,
  UpdateApplicationDto,
} from '../dto/applications/update-applications.dto';
import { Application } from '../entities/applications.entity';

export const IApplicationService = Symbol('IApplicationService');
export interface IApplicationService {
  create(createApplicationDto: CreateApplicationDto);
  findAll(paginationDto: PaginationDto, ctx: AppContext);
  findOne(id: number);
  updateByAdmin(
    id: number,
    updateApplicationDto: UpdateApplicationByAdminDto,
    userId: number,
  );
  update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    userId: number,
  );
  cancel(id: number, userId: number): Promise<Application>;
}
