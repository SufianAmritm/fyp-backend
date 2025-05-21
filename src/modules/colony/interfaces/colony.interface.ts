import { PassThrough } from 'stream';
import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { AppContext } from '../../../common/interfaces/context';
import { CreateColonyDto } from '../dto/create-colony.dto';
import { GetColonyDto } from '../dto/request/get.dto';
import { UpdateColonyDto } from '../dto/update-colony.dto';
import { Colony } from '../entities/colony.entity';

export const IColonyService = Symbol('IColonyService');
export interface IColonyService {
  create(createColonyDto: CreateColonyDto);
  findAll(
    getColonyDto: GetColonyDto,
    paginationDto: PaginationDto,
    ctx: AppContext,
    transfer?: boolean,
  );
  findAllForTransfer(getColonyDto: GetColonyDto, paginationDto: PaginationDto);
  findOne(id: number): Promise<Colony>;
  update(id: number, updateColonyDto: UpdateColonyDto, userId: number);
  downloadCsv(context: AppContext): Promise<PassThrough>;
  uploadCsv(context: AppContext, file: Express.Multer.File);
  remove(id: number, context: AppContext);
}
