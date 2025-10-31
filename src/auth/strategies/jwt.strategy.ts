import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/config.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>('jwt')!.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub);
    return user;
  }
}
