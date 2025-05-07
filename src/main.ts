import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { SWAGGER_PATH } from './common/constants';
import { ResponseInterceptor } from './common/interceptors/reponse-format-interceptor';
import { ColoredLogger } from './common/logger';
import { getSwaggerConfiguration } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
     bufferLogs:true,
    rawBody: true,
  });

  const configService: ConfigService = app.get(ConfigService);

  app.enableCors({    methods: ['PATCH', 'DELETE', 'HEAD', 'POST', 'PUT', 'GET', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,

    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useLogger(new ColoredLogger())
  await getSwaggerConfiguration(app);
  await app.listen(configService.get<number>('PORT'));

  const port = configService.get<number>('PORT') || 3000;

  const baseUrl = `http://localhost:${port}`;
  const swaggerUrl = `${baseUrl}${SWAGGER_PATH}/`;
  console.info(
    `Application is running on: \u001b]8;;${baseUrl}\u001b\\${baseUrl}\u001b]8;;\u001b\\`,
  );
  console.info(
    `Swagger is available on: \u001b]8;;${swaggerUrl}\u001b\\${swaggerUrl}\u001b]8;;\u001b\\`,
  );
}
bootstrap();
