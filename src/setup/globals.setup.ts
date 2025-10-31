import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '../shared/filters/http-exception.filter';

import { ValidationPipeOptionsConfig } from '../config/config.interface';

export function globalSetup(app: NestExpressApplication) {
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const configService = app.get(ConfigService); 

  const validationPipeOptions = configService.get<ValidationPipeOptionsConfig>(
    'validationPipeOptions',
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({   
      transform: validationPipeOptions?.transform,
      whitelist: validationPipeOptions?.whitelist,
    }),
  ); 


}