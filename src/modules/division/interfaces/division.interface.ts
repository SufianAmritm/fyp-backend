import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { GetDivisionsDto } from '../dto/request/get.dto';
import { UpdateDivisionDto } from '../dto/update-division.dto';

export const IDivisionService = Symbol('IDivisionService');
export interface IDivisionService {
  create(createDivisionDto: CreateDivisionDto);

  findAll(
    getDivisionDto: GetDivisionsDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
  );

  findOne(id: number);
  update(id: number, updateDivisionDto: UpdateDivisionDto);

  remove(id: number);
}
