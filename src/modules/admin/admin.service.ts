import { Inject, Injectable } from '@nestjs/common';
import { UserRoles } from '../../common/constants/enums';
import { IUserService } from '../user/interfaces/user.interface';
import { CreateAdminDto } from './dto/create-admin.dto';
import { IAdminService } from './interfaces/admin.interface';

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    return await this.userService.createUser(createAdminDto, UserRoles.ADMIN);
  }

  // findAll(paginationDto: PaginationDto, ctx: AppContext) {
  //   return this.adminRepository.findAll(paginationDto, ctx);
  // }

  //  findOne(id: number) {
  //    return this.adminRepository.findOne({ id });
  //  }

  // async update(id: number, updateAdminDto: UpdateAdminDto) {
  //   const adminUpdate = this.adminMapper.map(
  //     updateAdminDto,
  //     CreateAdminDto,
  //     Admin,
  //   );
  //   await this.adminRepository.update({ id }, adminUpdate);
  //   return RESPONSE_MESSAGES.UPDATED;
  // }

  //  async remove(id: number) {
  //    await this.adminRepository.softDelete({ id });
  //    return RESPONSE_MESSAGES.DELETED;
  //  }
}
