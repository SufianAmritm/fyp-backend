import { CreateAppLogDto } from '../dto/create-app-log.dto';
import { AppLog } from '../entities/app-log.entity';

export const IAppLogService = Symbol('IAppLogService');
export interface IAppLogService {
  create(createAppLogDto: CreateAppLogDto): Promise<AppLog>;
}
