import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbTransactionFactory } from 'src/common/database/utils/db-transaction-factory';
import { UtilsModule } from '../../common/utils/UtilsModule';
import { AwsModule } from '../aws/aws.module';
import { EmailModule } from '../email/email.module';
import { OtpModule } from '../otp/otp.module';
import { RoleModule } from '../role/role.module';
import { AppSetting } from './entities/settings.entity';
import { User } from './entities/user.entity';
import { IUserService } from './interfaces/user.interface';
import { SettingsMappingProfile } from './mapping/settings.mapping';
import { UserMappingProfile } from './mapping/user.mapping';
import { ISettingRepository } from './repositories/interfaces/settings-repository.interface';
import { IUserRepository } from './repositories/interfaces/user-repository.interface';
import { SettingRepository } from './repositories/setting.repository';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

export const userEntities = [User, AppSetting];

export const UserRepositoryProvider = [
  {
    provide: IUserRepository,
    useClass: UserRepository,
  },
  {
    provide: ISettingRepository,
    useClass: SettingRepository,
  },
];

const UserServiceProvider = [
  {
    provide: IUserService,
    useClass: UserService,
  },
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...userEntities]),
    EmailModule,
    UtilsModule,
    RoleModule,
    OtpModule,
    AwsModule,
  ],
  controllers: [UserController],
  providers: [
    DbTransactionFactory,
    ...UserRepositoryProvider,
    ...UserServiceProvider,
    UserMappingProfile,
    SettingsMappingProfile,
  ],
  exports: [...UserServiceProvider],
})
export class UserModule {}
