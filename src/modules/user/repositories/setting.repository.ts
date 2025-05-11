import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { AppSetting } from '../entities/settings.entity';
import { ISettingRepository } from './interfaces/settings-repository.interface';

@Injectable()
export class SettingRepository
  extends BaseRepository<AppSetting>
  implements ISettingRepository
{
  constructor(
    @InjectRepository(AppSetting)
    public readonly repository: Repository<AppSetting>,
  ) {
    super(repository);
  }
}
