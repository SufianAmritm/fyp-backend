import { SignUpDto } from 'src/modules/auth/dto/sign-up.dto';
import { AppContext } from '../../../common/interfaces/context';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AppSetting } from '../entities/settings.entity';
import { User } from '../entities/user.entity';

export const IUserService = Symbol('IUserService');

export interface IUserService {
  resetPassword(email: string, password: string): Promise<string>;
  createUser(signUpDto: SignUpDto,admin?:boolean): Promise<User>;
  update(id: number, data: UpdateUserDto): Promise<string>;
  remove(id: number): Promise<string>;
  activate(id: number): Promise<string>;
  findOneByEmail(email: string): Promise<User>;
  findOneById(id: number): Promise<User>;
  updateAppSettings(ctx: AppContext, dto: UpdateSettingsDto): Promise<string>;
  getSettings(userId: number): Promise<AppSetting>;
}
