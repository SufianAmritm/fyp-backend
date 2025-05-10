import { Body, Controller, Inject, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY } from 'src/common/constants';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/verify-otp.dto';
import { IAuthService } from './interface/auth.interface';
import { TokenTypeWithUser } from './type/auth.type';

@ApiTags(DOMAIN_ENTITY.AUTH)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign Up' })
  async signUp(@Body() signupDto: SignUpDto): Promise<TokenTypeWithUser> {
    return this.authService.signUp(signupDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign In' })
  async signIn(@Body() signInDto: SignInDto): Promise<TokenTypeWithUser> {
    return this.authService.signIn(signInDto);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  async resetPassword(
    @Body() resetDto: ResetPasswordDto,
  ): Promise<TokenTypeWithUser> {
    return this.authService.resetPassword(resetDto);
  }
  @Post('verify-otp')
  @ApiOperation({ summary: 'Reset Password' })
  async verifyOtp(@Body() verifyDto: VerifyOtpDto): Promise<
    | TokenTypeWithUser
    | {
        token: string;
      }
  > {
    return this.authService.verifyOtp(verifyDto);
  }
  @Post('send-otp')
  @ApiOperation({ summary: 'Reset Password' })
  async sendOtp(@Body() sendDTo: SendOtpDto): Promise<string> {
    return this.authService.sendOtp(sendDTo);
  }
}
