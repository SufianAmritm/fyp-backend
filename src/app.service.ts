import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { PROJECT_NAME } from './common/constants';
dotenv.config();
@Injectable()
export class AppService {
  checkServer(): string {
    return `The ${PROJECT_NAME} Up and Running.`;
  }
  getEnv(): string {
    return JSON.stringify(process.env);
  }
}
