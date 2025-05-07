import { HttpException } from '@nestjs/common';
import { APP_ERROR_MESSAGES } from '../constants/errors';

export class ExpiredTokenException extends HttpException {
  constructor() {
    super(APP_ERROR_MESSAGES.EXPIRED_TOKEN, 498);
  }
}
