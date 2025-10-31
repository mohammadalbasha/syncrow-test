import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceService } from './device.service';
import { Device, DeviceType } from '../repository/device.model';
import { NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';

describe('DeviceService', () => {
  let service: DeviceService;
  let repository: Repository<Device>;

  const mockDevice: Device = {
    id: 1,
    name: 'Test Device',
    type: DeviceType.lamp,
    location: 'Room 101',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Device;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    repository = module.get<Repository<Device>>(getRepositoryToken(Device));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new device', async () => {
      const createDto: CreateDeviceDto = {
        name: 'Test Device',
        type: DeviceType.lamp,
        location: 'Room 101',
      };

      mockRepository.create.mockReturnValue(mockDevice);
      mockRepository.save.mockResolvedValue(mockDevice);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual(mockDevice);
    });
  });

  describe('findAll', () => {
    it('should return paginated devices with default pagination', async () => {
      const devices = [mockDevice];
      mockRepository.findAndCount.mockResolvedValue([devices, 1]);

      const result = await service.findAll();

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.data).toEqual(devices);
      expect(result.total).toBe(1);
    });

    it('should return paginated devices with custom pagination', async () => {
      const devices = [mockDevice];
      mockRepository.findAndCount.mockResolvedValue([devices, 1]);

      const result = await service.findAll(2, 5);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.data).toEqual(devices);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a device by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDevice);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDevice);
    });

    it('should throw NotFoundException when device not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Device not found');
    });
  });

  describe('update', () => {
    it('should update an existing device', async () => {
      const updateDto: UpdateDeviceDto = {
        name: 'Updated Device',
        type: DeviceType.fan,
        location: 'Room 202',
      };

      const updatedDevice = { ...mockDevice, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockDevice);
      mockRepository.save.mockResolvedValue(updatedDevice);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated Device');
      expect(result.type).toBe(DeviceType.fan);
    });

    it('should throw NotFoundException when updating non-existent device', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' } as UpdateDeviceDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a device', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when device not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('Device not found');
    });
  });
});

