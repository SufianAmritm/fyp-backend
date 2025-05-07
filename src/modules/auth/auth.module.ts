import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IAuthService } from './interface/auth.interface';
import { UtilsModule } from '../../common/utils/UtilsModule';
import { OtpModule } from '../otp/otp.module';

const authServiceProvider = [
  {
    provide: IAuthService,
    useClass: AuthService,
  },
];
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    UtilsModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [...authServiceProvider, AuthService],
  exports: [...authServiceProvider],
})
export class AuthModule {}
