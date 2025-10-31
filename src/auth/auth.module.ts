import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { AuthRepository } from './repository/auth.repository';
import { User } from './repository/user.model';
import { RefreshToken } from './repository/refresh-token.model';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/config.interface';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]),
   PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<JwtConfig>('jwt')!.secret,
      signOptions: {
        expiresIn: 
          configService.get<JwtConfig>('jwt')!.accessTokenExpiresIn,

        
      },
      
    }) as JwtModuleOptions,
    inject: [ConfigService],

  })],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository,  JwtStrategy],
  exports:[ PassportModule,
    JwtModule,
    AuthService,]
})
export class AuthModule {}
