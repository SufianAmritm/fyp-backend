import { PassThrough } from 'stream';
import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateDivisionDto } from '../dto/create-division.dto';
import { GetDivisionsDto } from '../dto/request/get.dto';
import { UpdateDivisionDto } from '../dto/update-division.dto';

export const IDivisionService = Symbol('IDivisionService');
export interface IDivisionService {
  create(createDivisionDto: CreateDivisionDto);

  findAll(getDivisionDto: GetDivisionsDto, paginationDto: PaginationDto);

  findOne(id: number);
  update(id: number, updateDivisionDto: UpdateDivisionDto);

  remove(id: number);
  downloadCsv(context: AppContext): Promise<PassThrough>;
  uploadCsv(context: AppContext, file: Express.Multer.File);
}
