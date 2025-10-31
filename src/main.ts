import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestConfig } from './config/config.interface';
import { globalSetup } from './setup/globals.setup';
import { securitySetup } from './setup/security.setup';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService); 
  const nestConfig = configService.get<NestConfig >('nest');



  /**
   *  Global setup:
   *  Global-Prefix
   *  Global-Pipes (ValidationPipe, i18nValidationPipe)
   *  Global-Filter
   *  Versioning
   */
  globalSetup(app);

  
  /**
   *  Middlwware setup:
   *  Request middleware for cerating unique id for each http request
   */
//  middlewareSetup(app);

  /**
   *  Setup security
   *  Helmet & CSRF & CORS
   */
  securitySetup(app);
  await app.listen(nestConfig?.port ?? 3000);


}
bootstrap();
