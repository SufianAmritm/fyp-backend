import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, X_API_KEY } from 'src/common/constants';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { TokenType, TokenTypeWithUser } from './type/auth.type';

@ApiTags(DOMAIN_ENTITY.AUTH)
@ApiBearerAuth(X_API_KEY)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign Up' })
  async signUp(@Body() signupDto: SignUpDto): Promise<TokenType> {
    return this.authService.signUp(signupDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign In' })
  async signIn(@Body() signInDto: SignInDto): Promise<TokenTypeWithUser> {
    return this.authService.signIn(signInDto);
  }

  // @Post('forget-password')
  // @ApiOperation({ summary: 'Forget Password' })
  // async forgetPassword(
  //   @Body() forgotPasswordDto: ForgetPasswordDto,
  // ): Promise<string> {
  //   const { email } = forgotPasswordDto;
  //   return this.authService.forgetPassword(email);
  // }

  // @Patch('reset-password')
  // @ApiOperation({ summary: 'Reset Password' })
  // async resetPassword(@Body() resetDto: ResetPasswordDto): Promise<string> {
  //   return this.authService.resetPassword(resetDto);
  // }
}
