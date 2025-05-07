import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { UpdateDivisionDto } from '../dto/update-division.dto';

export const IDivisionService = Symbol('IDivisionService');
export interface IDivisionService {
  create(createDivisionDto: CreateDivisionDto);

  findAll(paginationDto: PaginationDto);

  findOne(id: number);
  update(id: number, updateDivisionDto: UpdateDivisionDto);

  remove(id: number);
}
