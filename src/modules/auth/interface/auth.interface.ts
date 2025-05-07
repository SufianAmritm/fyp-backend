import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { SendOtpDto, VerifyOtpDto } from '../dto/verify-otp.dto';
import { TokenTypeWithUser } from '../type/auth.type';

export const IAuthService = Symbol('IAuthService');

export interface IAuthService {
  signUp(signupDto: SignUpDto): Promise<TokenTypeWithUser>;
  signIn(signInDto: SignInDto): Promise<TokenTypeWithUser>;
  resetPassword(resetDto: ResetPasswordDto): Promise<TokenTypeWithUser>;
  verifyOtp(dto: VerifyOtpDto): Promise<TokenTypeWithUser | { token: string }>;
  sendOtp(sendOtpDto: SendOtpDto): Promise<string>;
}
