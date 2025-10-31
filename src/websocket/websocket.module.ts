import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/repository/user.model';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}

