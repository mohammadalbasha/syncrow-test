import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/config.interface';
import { AuthService } from '../service/auth.service';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../repository/user.model';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    try {
      // Extract token from handshake auth or query
      const token = this.extractTokenFromSocket(client);
      
      if (!token) {
        client.disconnect();
        throw new UnauthorizedException('No token provided');
      }

      // Verify JWT token
      const jwtConfig = this.configService.get<JwtConfig>('jwt');
      const payload = this.jwtService.verify(token, {
        secret: jwtConfig!.secret,
      });

      // Find user by ID from JWT payload (payload.sub contains user ID)
      // Following the same pattern as JwtStrategy, but fixing it to actually work
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      
      if (!user) {
        client.disconnect();
        throw new UnauthorizedException('User not found');
      }

      // Attach user to socket data for later use
      client.data.user = user;
      
      return true;
    } catch (error) {
      // If client is still connected, disconnect it
      if (client.connected) {
        client.disconnect();
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from auth object (when using socket.auth.token)
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // Try to get token from query parameters (when using ?token=...)
    if (client.handshake.query?.token) {
      return Array.isArray(client.handshake.query.token)
        ? client.handshake.query.token[0]
        : client.handshake.query.token;
    }

    // Try to get token from Authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}

