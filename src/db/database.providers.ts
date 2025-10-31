import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/config.interface';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const dbConfig = configService.get<DatabaseConfig>('database');
    if (!dbConfig) throw new Error('Database configuration not found');
    return {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [__dirname + '/../**/*.model.{ts,js}'],
      synchronize: true, // TODO: Remove in production
      logging: true,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    };
  },
  inject: [ConfigService],
});
