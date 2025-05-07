import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { IAdminService } from './interfaces/admin.interface';
import { AdminMappingProfile } from './mapping/admin.mapping';

const adminEntities = [];
const adminRepositoryProvider = [
];
const adminServiceProvider = [
  {
    provide: IAdminService,
    useClass: AdminService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(adminEntities),UserModule],
  controllers: [AdminController],
  providers: [
    ...adminServiceProvider,
    ...adminRepositoryProvider,
    AdminMappingProfile,
  ],
  exports: [...adminServiceProvider],
})
export class AdminModule {}
