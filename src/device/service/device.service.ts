import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../repository/device.model';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { WebSocketGateway } from 'src/websocket/websocket.gateway';
import { WS_EVENTS } from 'src/websocket/constants';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(dto: CreateDeviceDto): Promise<Device> {
    const entity = this.deviceRepository.create(dto);
    const result = await this.deviceRepository.save(entity);
    return result;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await this.deviceRepository.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC', 
      },
    });

    return {
      data,
      total,
    };
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async update(id: number, dto: UpdateDeviceDto): Promise<Device> {

    const device = await this.findOne(id);
    if (!device) throw new NotFoundException('Device not found');
   // or const updated = await this.deviceRepository.update(id, dto);
    Object.assign(device, dto);
    return this.deviceRepository.save(device);
  }

  async remove(id: number): Promise<void> {
    const result = await this.deviceRepository.delete({ id });
    if (result.affected === 0) throw new NotFoundException('Device not found');
  }
}




