import { SignUpDto } from '../dto/sign-up.dto';
import { TokenTypeWithUser } from '../type/auth.type';

export const IAuthService = Symbol('IAuthService');

export interface IAuthService {
  signUp(
    signupDto: SignUpDto,
  ): Promise<TokenTypeWithUser>;
}
