import { CreateManagersDto } from '../dto/create-managers.dto';

export const IManagersService = Symbol('IManagersService');
export interface IManagersService {
  create(createManagersDto: CreateManagersDto, picture: Express.Multer.File);
}
