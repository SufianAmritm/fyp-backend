import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { AppSetting } from '../../entities/settings.entity';

export const ISettingRepository = Symbol('ISettingRepository');

type DefaultEntity = AppSetting;
export interface ISettingRepository<T = DefaultEntity>
  extends IBaseRepository<T> {}
