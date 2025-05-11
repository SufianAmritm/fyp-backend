import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateApplicationDto } from '../dto/applications/create-applications.dto';
import { UpdateApplicationDto } from '../dto/applications/update-applications.dto';

export const IApplicationService = Symbol('IApplicationService');
export interface IApplicationService {
  create(createApplicationDto: CreateApplicationDto);
  findAll(paginationDto: PaginationDto, ctx: AppContext);
  findOne(id: number);
  update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    userId: number,
  );
}
