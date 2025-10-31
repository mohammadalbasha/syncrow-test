import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
// import * as csurf from 'csurf';
// import { doubleCsrf } from 'csrf-csrf';
import { AppModule } from 'src/app.module';
import { CorsConfig } from 'src/config/config.interface';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UniqueValidator } from 'src/shared/decorators/unique.input.decorator';

export function securitySetup(app: NestExpressApplication) {
  const configService = app.get(ConfigService);
  const corsConfig = configService.get<CorsConfig>('cors');
  if (corsConfig?.enabled) app.enableCors();



  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
    fallback: true,
  }); // for custom validators like unique

  // Initialize DataSource in validator after app is set up
  try {
    const dataSource = app.get(DataSource);
    if (dataSource) {
      UniqueValidator.setDataSource(dataSource);
    }
  } catch (error) {
    console.warn('Could not initialize DataSource in UniqueValidator:', error);
  }
}