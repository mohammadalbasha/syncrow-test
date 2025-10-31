import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './repository/device.model';
import { DeviceService } from './service/device.service';
import { DeviceController } from './controller/device.controller';
import { WebSocketModule } from 'src/websocket/websocket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), WebSocketModule ],
  providers: [DeviceService],
  controllers: [DeviceController],
})
export class DeviceModule {}





