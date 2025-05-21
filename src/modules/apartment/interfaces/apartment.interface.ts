import { PassThrough } from 'stream';
import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateApartmentDto } from '../dto/create-apartment.dto';
import { GetApartmentDto } from '../dto/request/get.dto';
import { UpdateApartmentDto } from '../dto/update-apartment.dto';

export const IApartmentService = Symbol('IApartmentService');
export interface IApartmentService {
  create(createApartmentDto: CreateApartmentDto);
  findAll(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
    context: AppContext,
  );
  findOne(id: number);
  update(id: number, updateApartmentDto: UpdateApartmentDto, userId: number);
  findAllForTransfer(
    getApartmentDto: GetApartmentDto,
    paginationDto: PaginationDto,
  );
  downloadCsv(context: AppContext): Promise<PassThrough>;
  uploadCsv(context: AppContext, file: Express.Multer.File);
  remove(id: number, context: AppContext): Promise<string>;
}
