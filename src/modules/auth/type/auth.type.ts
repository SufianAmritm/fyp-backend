import { User } from '../../user/entities/user.entity';

export interface TokenType {
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface TokenTypeWithUser {
  accessToken: string;
  refreshToken: string;
  message: string;
  user: User;
}
