import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/database/repositories/base/base.repository';
import { Repository } from 'typeorm';
import { ISettingRepository } from './interfaces/settings-repository.interface';
import { AppSetting } from '../entities/settings.entity';

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
