import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateApartmentDto } from '../dto/create-apartment.dto';
import { GetApartmentDto } from '../dto/request/get.dto';
import { UpdateApartmentDto } from '../dto/update-apartment.dto';

export const IApartmentService = Symbol('IApartmentService');
export interface IApartmentService {
  create(createApartmentDto: CreateApartmentDto);
  findAll(getApartmentDto: GetApartmentDto, paginationDto: PaginationDto);
  findOne(id: number);
  update(id: number, updateApartmentDto: UpdateApartmentDto);
}
