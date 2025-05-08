import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RESPONSE_MESSAGES } from 'src/common/constants';
import { APP_ERROR_MESSAGES } from 'src/common/constants/errors';
import { OTP_TYPE, UserRoles } from '../../common/constants/enums';
import { UtilsService } from '../../common/utils/UtilsService';
import { IOtpService } from '../otp/interfaces/otp.interface';
import { IUserService } from '../user/interfaces/user.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { IAuthService } from './interface/auth.interface';
import { TokenType, TokenTypeWithUser } from './type/auth.type';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,
    @Inject(IOtpService) private readonly otpService: IOtpService,

    private readonly jwtService: JwtService,
    private readonly utilService: UtilsService,
    private readonly configService: ConfigService,
  ) {}
  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<TokenTypeWithUser | { token: string }> {
    const verified = await this.otpService.verifyOtp(dto.otp, dto.type);
    if (!verified)
      throw new BadRequestException(APP_ERROR_MESSAGES.INVALID_OTP);
    verified.user.password = undefined;
    switch (dto.type) {
      case OTP_TYPE.REGISTRATION: {
        await this.userService.update(verified.user.id, {
          emailVerified: true,
        });
        const { id, email, role } = verified.user;
        const tokens = await this.getTokens(id, email, role.name, true);
        return {
          ...tokens,
          user: verified.user,
        };
      }
      case OTP_TYPE.RESET_PASSWORD: {
        const token = await this.getResetToken(verified.user.email, dto.type);
        return { token };
      }
      default: {
        throw new BadRequestException(APP_ERROR_MESSAGES.INVALID_OTP_TYPE);
      }
    }
  }

  async signUp(signupDto: SignUpDto): Promise<TokenTypeWithUser> {
    signupDto.password = await this.utilService.hash(signupDto.password);
    const user = await this.userService.createUser(signupDto);

    const { id, email, role, emailVerified } = user;
    const tokens = await this.getTokens(id, email, role.name, emailVerified);
    return {
      ...tokens,
      user,
    };
  }

  async signIn(signInDto: SignInDto): Promise<TokenTypeWithUser> {
    const { email, password } = signInDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    }
    if (user.role.name === UserRoles.MANAGER && !user.password) {
      throw new UnauthorizedException({
        message: APP_ERROR_MESSAGES.INVALID_PASSWORD,
        statusCode: 'manager_password_not_set',
      });
    }
    const isPasswordMatch = await this.utilService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(APP_ERROR_MESSAGES.INVALID_PASSWORD);
    }
    user.password = undefined;
    const { id, role, emailVerified } = user;
    const tokens = await this.getTokens(id, email, role.name, emailVerified);
    return {
      ...tokens,
      user,
    };
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<TokenTypeWithUser> {
    const { password, token } = resetDto;
    const decryptedToken = await this.verifyToken(token);
    if (
      !decryptedToken ||
      !decryptedToken?.purpose ||
      decryptedToken.purpose !== OTP_TYPE.RESET_PASSWORD
    )
      throw new BadRequestException(
        APP_ERROR_MESSAGES.FAILED_OPERATION('Verify'),
      );

    const user = await this.userService.resetPassword(
      decryptedToken.email,
      password,
    );
    const { id, email, role, emailVerified } = user;
    const tokens = await this.getTokens(id, email, role.name, emailVerified);
    user.password = undefined;
    return {
      ...tokens,
      user,
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<string> {
    const { email, type } = sendOtpDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    }
    await this.userService.sendPasswordResetEmail(user, type);
    return RESPONSE_MESSAGES.EMAIL_SENT;
  }

  private async getTokens(
    id: number,
    email: string,
    role: string,
    emailVerified: boolean,
  ): Promise<TokenType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
          role,
          emailVerified,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        {
          id,
          email,
          role,
          emailVerified,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return {
      message: RESPONSE_MESSAGES.SIGN_IN,
      accessToken,
      refreshToken,
    };
  }
  private async getResetToken(email: string, purpose: OTP_TYPE) {
    const [token] = await Promise.all([
      this.jwtService.signAsync(
        {
          email,
          purpose,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get<number>(
            'EMAIL_VERIFICATION_EXPIRATION_MINUTES',
          ),
        },
      ),
    ]);
    return token;
  }
  private async verifyToken(
    token: string,
  ): Promise<{ email: string; purpose: OTP_TYPE } | undefined> {
    try {
      const verify = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      });

      if (verify) return verify;
    } catch (err) {
      console.error(err);
    }
    return undefined;
  }
}
