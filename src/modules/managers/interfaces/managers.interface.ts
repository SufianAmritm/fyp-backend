import { PaginationDto } from '../../../common/dtos/request/pagination.dto';
import { CreateManagersDto } from '../dto/create-managers.dto';
import { UpdateManagersDto } from '../dto/update-managers.dto';
import { Manager } from '../entities/managers.entity';

export const IManagersService = Symbol('IManagersService');
export interface IManagersService {
  create(createManagersDto: CreateManagersDto, picture?: Express.Multer.File);
  update(
    id: number,
    updateManagersDto: UpdateManagersDto,
    picture: Express.Multer.File,
  );
  findOne(id: number);
  findAll(paginationDto: PaginationDto);
  findOneByUserIdWithColonies(id: number): Promise<Manager>;

  findOneByUserIdWithColoniesAndEmployees(id: number): Promise<Manager>;
}
