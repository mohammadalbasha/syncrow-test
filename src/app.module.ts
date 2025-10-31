import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from './config/module-options';
import { DatabaseModule } from './db/database.providers';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { WebSocketModule } from './websocket/websocket.module';
import { UniqueValidator } from './shared/decorators/unique.input.decorator';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          // Store request in CLS context
          cls.set('req', req);
        },
      },
    }),
    DatabaseModule,
    AuthModule,
    DeviceModule,
    WebSocketModule,
  ],
  
  providers: [ UniqueValidator]
})
export class AppModule {}
