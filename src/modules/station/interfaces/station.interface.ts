import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateStationDto } from '../dto/create-station.dto';
import { GetStationDto } from '../dto/request/get.dto';
import { UpdateStationDto } from '../dto/update-station.dto';

export const IStationService = Symbol('IStationService');
export interface IStationService {
  create(createStationDto: CreateStationDto);

  findAll(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
    transfer?: boolean,
  );

  findOne(id: number);
  update(id: number, updateStationDto: UpdateStationDto);

  remove(id: number);
  findAllForTransfer(
    getStationDto: GetStationDto,
    paginationDto: PaginationDto,
  );
}
