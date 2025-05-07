import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RESPONSE_MESSAGES } from 'src/common/constants';
import { APP_ERROR_MESSAGES } from 'src/common/constants/errors';
import { UtilsService } from '../../common/utils/UtilsService';
import { IUserService } from '../user/interfaces/user.interface';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { IAuthService } from './interface/auth.interface';
import { TokenType, TokenTypeWithUser } from './type/auth.type';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(IUserService) private readonly userService: IUserService,

    private readonly jwtService: JwtService,
    private readonly utilService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(
    signupDto: SignUpDto,
  ): Promise<TokenTypeWithUser> {
    signupDto.password = await this.utilService.hash(signupDto.password);
    const newUser = await this.userService.createUser(signupDto);

    const { id, email, role } = newUser;
    return {
      ...(await this.getTokens(id, email, role.name)),
      user: newUser,
    };
  }

  async signIn(signInDto: SignInDto): Promise<TokenTypeWithUser> {
    const { email, password } = signInDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
    }

    const isPasswordMatch = await this.utilService.compare(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException(APP_ERROR_MESSAGES.INVALID_PASSWORD);
    }
    delete user.password;
    const { id, role } = user;
    return {
      ...(await this.getTokens(id, email, role.name)),
      user: user,
    };
  }

  // async resetPassword(resetDto: ResetPasswordDto): Promise<string> {
  //   const { password, token } = resetDto;
  //   const decryptedToken = await this.verifyToken(token);
  //   if (!decryptedToken)
  //     throw new BadRequestException(
  //       APP_ERROR_MESSAGES.FAILED_OPERATION('Verify'),
  //     );

  //   const resetVerify = await this.tokenService.resetPassword({
  //     ...resetDto,
  //     email: decryptedToken.email,
  //     tenantId: decryptedToken.tenantId,
  //   });
  //   if (!resetVerify) {
  //     throw new InternalServerErrorException(
  //       'Something went wrong while verifying token.',
  //     );
  //   }
  //   const hashedPassword = await this.utilService.hash(password);

  //   return this.userService.resetPassword(decryptedToken.email, hashedPassword);
  // }

  // async forgetPassword(email: string): Promise<string> {
  //   const user = await this.userService.findOneByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException(APP_ERROR_MESSAGES.NOT_FOUND('User'));
  //   }
  //   const emailExpiryMinutes = Number(
  //     this.configService.get<number>('EMAIL_VERIFICATION_EXPIRATION_MINUTES'),
  //   );
  //   const token = this.jwtService.sign(
  //     {
  //       email,
  //     },
  //     {
  //       secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
  //       expiresIn: emailExpiryMinutes * 60,
  //     },
  //   );
  //   const tokenDto = {
  //     email,
  //     expireOn: BigInt(Date.now() + emailExpiryMinutes * 60 * 1000),
  //     token,
  //     userId:user.id
  //   };
  //   return this.tokenService.forgetPassword(tokenDto);
  // }

  private async getTokens(
    id: number,
    email: string,
    role:string
  ): Promise<TokenType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id,
          email,
          role
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
          role
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

  // async verifyToken(
  //   token: string,
  // ): Promise<{ email: string; tenantId: number } | undefined> {
  //   try {
  //     const verify = this.jwtService.verify(token, {
  //       secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
  //     });

  //     if (verify) return verify;
  //   } catch (err) {
  //     console.error(err);
  //   }
  //   return undefined;
  // }
}
