export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  validationPipeOptions: ValidationPipeOptionsConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
}

export interface NestConfig {
  port: number;
  environment: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface ValidationPipeOptionsConfig {
  transform: boolean;
  whitelist: boolean;
}

export interface SecurityConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
}

export interface JwtConfig   {
  secret: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

