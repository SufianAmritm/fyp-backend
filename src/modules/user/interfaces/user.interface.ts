import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { EntityManager } from 'typeorm';
import { OTP_TYPE } from '../../../common/constants/enums';
import { AppContext } from '../../../common/interfaces/context';
import { CreateAdminDto } from '../../admin/dto/create-admin.dto';
import { CreateEmployeeDto } from '../../employee/dto/create-employee.dto';
import { NewEmployeeUserReturn } from '../../employee/types';
import { CreateManagersDto } from '../../managers/dto/create-managers.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AppSetting } from '../entities/settings.entity';
import { User } from '../entities/user.entity';
import { EmailData, NewManagerUserReturn } from '../types';

export const IUserService = Symbol('IUserService');

export interface IUserService {
  resetPassword(email: string, password: string): Promise<User>;
  createUser(signUpDto: SignUpDto): Promise<User>;
  createManager(dto: CreateManagersDto): Promise<NewManagerUserReturn>;
  createAdmin(dto: CreateAdminDto): Promise<User>;
  createEmployee(dto: CreateEmployeeDto): Promise<NewEmployeeUserReturn>;
  update(id: number, data: UpdateUserDto): Promise<string>;
  remove(id: number): Promise<string>;
  activate(id: number): Promise<string>;
  findOneByEmail(email: string): Promise<User>;
  findOneById(id: number): Promise<User>;
  updateAppSettings(ctx: AppContext, dto: UpdateSettingsDto): Promise<string>;
  getSettings(userId: number): Promise<AppSetting>;
  sendEmailForNoPassword(
    user: User,
    emailData: EmailData,
    manager: EntityManager,
  ): Promise<void>;
  sendPasswordResetEmail(user: User, otpType: OTP_TYPE): Promise<void>;
  getProfile(id: number): Promise<User>;
  updateProfile(
    id: number,
    dto: UpdateUserDto,
    cnicFront?: Express.Multer.File,
    cnicBack?: Express.Multer.File,
    serviceCard?: Express.Multer.File,
    picture?: Express.Multer.File,
  ): Promise<User>;
}
