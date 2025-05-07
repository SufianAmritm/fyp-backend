import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { X_API_KEY } from '../constants';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers[X_API_KEY];
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing.');
    }

    const validApiKey = this.configService.get<string>('X_API_KEY');
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key.');
    }
    return true;
  }
}
