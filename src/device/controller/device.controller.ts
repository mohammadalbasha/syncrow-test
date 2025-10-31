import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query } from '@nestjs/common';
import { DeviceService } from '../service/device.service';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { AdminRoleGuard } from 'src/auth/guards/admin-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { WS_EVENTS } from 'src/websocket/constants';
import { WebSocketGateway } from 'src/websocket/websocket.gateway';



@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService, private readonly webSocketGateway: WebSocketGateway) {}

  @Post()
  async create(@Body() dto: CreateDeviceDto) {
    const result = await  this.deviceService.create(dto);
    this.webSocketGateway.emitToAll(WS_EVENTS.DEVICE_CREATED, result);
    return result;
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    return this.deviceService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deviceService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDeviceDto) {
    
    const result = await this.deviceService.update(id, dto);
    this.webSocketGateway.emitToAll(WS_EVENTS.DEVICE_UPDATED, result);
    return result;
  }

  @UseGuards(AdminRoleGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) { 
    const result = await this.deviceService.remove(id);
    this.webSocketGateway.emitToAll(WS_EVENTS.DEVICE_DELETED, result);
    return result;
  }
}




