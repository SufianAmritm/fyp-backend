import { IBaseRepository } from 'src/common/database/repositories/interfaces/base.interface';
import { Otp } from '../../entities/otp.entity';

export const IOtpRepository = Symbol('IOtpRepository');

type DefaultEntity = Otp;
export interface IOtpRepository<T = DefaultEntity> extends IBaseRepository<T> {}
