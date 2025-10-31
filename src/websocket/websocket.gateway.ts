import {
  WebSocketGateway as WsGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WS_ROOMS } from './constants';
import { WS_EVENTS } from './constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfig } from 'src/config/config.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/repository/user.model';

@WsGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  afterInit(server: Server) {
    // Authentication middleware - runs during handshake, before connection is established
    server.use((socket: Socket, next: (err?: Error) => void) => {
      void (async () => {
        try {
          const token = this.extractTokenFromSocket(socket);
          if (!token) {
            this.logger.warn(`Connection rejected: No token provided - ${socket.id}`);
            next(new Error('Authentication error: No token provided'));
            return;
          }

          const jwtConfig = this.configService.get<JwtConfig>('jwt');
          const payload = this.jwtService.verify(token, {
            secret: jwtConfig!.secret,
          });

          const user = await this.userRepository.findOne({
            where: { id: payload.sub },
          });
          
          if (!user) {
            this.logger.warn(`Connection rejected: User not found - ${socket.id}`);
            next(new Error('Authentication error: User not found'));
            return;
          }

          socket.data.user = user;
          this.logger.log(`User authenticated: ${user.username} (${socket.id})`);
          next();
        } catch (error: any) {
          this.logger.warn(`Connection rejected: Invalid token - ${socket.id}`, error?.message || error);
          next(new Error('Authentication error: Invalid token'));
        }
      })();
    });
  }

  private extractTokenFromSocket(client: Socket): string | null {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    if (client.handshake.query?.token) {
      return Array.isArray(client.handshake.query.token)
        ? client.handshake.query.token[0]
        : client.handshake.query.token;
    }

    
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }

  handleConnection(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client connected: ${client.id}, User: ${user?.username || 'Unknown'}`);
    
    if (user) {
      void client.join(WS_ROOMS.USER(user.id));
      void client.join(WS_ROOMS.DEVICES);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Client disconnected: ${client.id}, User: ${user?.username || 'Unknown'}`);
  }

  @SubscribeMessage(WS_EVENTS.MESSAGE)
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const user = client.data.user;
    this.logger.log(`Message from ${user?.username}:`, data);
    
    return {
      event: WS_EVENTS.MESSAGE,
      data: {
        message: `Echo: ${data.message || 'Hello'}`,
        user: user?.username,
      },
    };
  }

  @SubscribeMessage(WS_EVENTS.PING)
  handlePing(@ConnectedSocket() client: Socket) {
    this.logger.log(`Ping from ${client.id}`);
    return {
      event: WS_EVENTS.PONG,
      data: { timestamp: new Date().toISOString() },
    };
  }

  emitToUser(userId: number, event: string, data: any) {
    this.server.to(WS_ROOMS.USER(userId)).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToRoom(roomName: string, event: string, data: any) {
    this.server.to(roomName).emit(event, data);
  }
}

