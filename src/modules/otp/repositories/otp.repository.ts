import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { IOtpRepository } from './interface/otp-repository.interface';

@Injectable()
export class OtpRepository
  extends BaseRepository<Otp>
  implements IOtpRepository
{
  constructor(
    @InjectRepository(Otp)
    public readonly repository: Repository<Otp>,
  ) {
    super(repository);
  }
}
