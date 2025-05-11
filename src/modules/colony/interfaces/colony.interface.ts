import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateColonyDto } from '../dto/create-colony.dto';
import { GetColonyDto } from '../dto/request/get.dto';
import { UpdateColonyDto } from '../dto/update-colony.dto';

export const IColonyService = Symbol('IColonyService');
export interface IColonyService {
  create(createColonyDto: CreateColonyDto);
  findAll(getColonyDto: GetColonyDto, paginationDto: PaginationDto);
  findOne(id: number);
  update(id: number, updateColonyDto: UpdateColonyDto);
}
