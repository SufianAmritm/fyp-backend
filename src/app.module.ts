import { classes } from '@automapper/classes';
import { CamelCaseNamingConvention } from '@automapper/core';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './common/database';
import { SeederModule } from './common/database/seeders/seed.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AdminModule } from './modules/admin/admin.module';
import { ApartmentModule } from './modules/apartment/apartment.module';
import { ApplicationModule } from './modules/applications/applications.module';
import { AuthModule } from './modules/auth/auth.module';
import { ColonyModule } from './modules/colony/colony.module';
import { DivisionModule } from './modules/division/division.module';
import { EmployeeVerificationModule } from './modules/employee-verification/employee-verification.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { envSchema } from './modules/env/env';
import { EnvModule } from './modules/env/env.module';
import { EventsModule } from './modules/events/events.module';
import { ManagersModule } from './modules/managers/managers.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';
import { RoleModule } from './modules/role/role.module';
import { StationModule } from './modules/station/station.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseModule,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),

    AutomapperModule.forRoot({
      strategyInitializer: classes(),
      namingConventions: new CamelCaseNamingConvention(),
    }),
    /* Add Module in Alphabetical Order */
    AuthModule,
    AdminModule,
    ApartmentModule,
    ApplicationModule,
    ColonyModule,
    DivisionModule,
    EmployeeModule,
    EmployeeVerificationModule,
    EnvModule,
    ManagersModule,
    RoleModule,
    RolePermissionModule,
    SeederModule,
    StationModule,
    UserModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ApiKeyGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(userContext: MiddlewareConsumer) {
    userContext.apply(LoggerMiddleware).forRoutes('*');
  }
}
