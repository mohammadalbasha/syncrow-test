import { Config } from './config.interface';

//env: process.env.APP_ENV,

export default (): Config => ({
  nest: {
    port: +process.env.PORT! || 3000,
    environment: process.env.APP_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL! === 'true',
  },
  cors: {
    enabled: true,
  },
  validationPipeOptions: {
    transform: true,
    whitelist: false,
  },
  jwt: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET!,
    accessTokenExpiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES!) * 60 * 1000,
    refreshTokenExpiresIn: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_DAYS!) * 24 * 60 * 60 * 1000,
  },
});
