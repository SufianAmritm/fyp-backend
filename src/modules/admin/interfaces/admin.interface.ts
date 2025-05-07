import { CreateAdminDto } from '../dto/create-admin.dto';

export const IAdminService = Symbol('IAdminService');
export interface IAdminService {
  create(createAdminDto: CreateAdminDto)
}
