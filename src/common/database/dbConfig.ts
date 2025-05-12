import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import { RolePermission } from 'src/modules/role-permission/entities/role-permission.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Apartment } from '../../modules/apartment/entities/apartment.entity';
import { AppLog } from '../../modules/app-log/entities/app-log.entity';
import { ApplicationPriority } from '../../modules/applications/entities/application-colonies.entity';
import { Application } from '../../modules/applications/entities/applications.entity';
import { Colony } from '../../modules/colony/entities/colony.entity';
import { Division } from '../../modules/division/entities/division.entity';
import { EmployeeVerification } from '../../modules/employee-verification/entities/employee-verification.entity';
import { Employee } from '../../modules/employee/entities/employee.entity';
import { Manager } from '../../modules/managers/entities/managers.entity';
import { Occupation } from '../../modules/occupations/entities/occupations.entity';
import { VacancyRequest } from '../../modules/occupations/entities/vacancy-requests.entity';
import { Otp } from '../../modules/otp/entities/otp.entity';
import { Station } from '../../modules/station/entities/station.entity';
import { AppSetting } from '../../modules/user/entities/settings.entity';
import { Seed } from './seeders/entities/seed.entity';
import { TransferRequest } from '../../modules/occupations/entities/transfer-requests.entity';

config();

const configService = new ConfigService();
const isLocalhost = configService.get<string>('DB_HOST') === 'localhost';
const sslOptions = isLocalhost
  ? {}
  : {
      ssl: {
        rejectUnauthorized: false,
      },
    };
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [
    User,
    Role,
    RolePermission,
    Seed,
    Station,
    // UserNotification,
    AppSetting,
    AppLog,
    Otp,
    Division,
    Manager,
    Apartment,
    Colony,
    Employee,
    EmployeeVerification,
    Application,
    ApplicationPriority,
    Occupation,
    VacancyRequest,
    TransferRequest,
  ],
  synchronize: false,
  logging: false,
  extra: {
    ...sslOptions,
  },
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
});

export default dataSource;
