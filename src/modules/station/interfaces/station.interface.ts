import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateStationDto } from '../dto/create-station.dto';
import { UpdateStationDto } from '../dto/update-station.dto';

export const IStationService = Symbol('IStationService');
export interface IStationService {
  create(createStationDto: CreateStationDto);

  findAll(paginationDto: PaginationDto);

  findOne(id: number);
  update(id: number, updateStationDto: UpdateStationDto);

  remove(id: number);
}
