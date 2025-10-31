import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceType } from './device.model';

describe('DeviceRepository', () => {
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
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Device),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<Repository<Device>>(getRepositoryToken(Device));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a device entity from plain object', () => {
      const dto = {
        name: 'Test Device',
        type: DeviceType.lamp,
        location: 'Room 101',
      };

      mockRepository.create.mockReturnValue(mockDevice);

      const result = repository.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDevice);
    });

    it('should create multiple device entities', () => {
      const dtos = [
        { name: 'Device 1', type: DeviceType.lamp },
        { name: 'Device 2', type: DeviceType.fan },
      ];

      mockRepository.create.mockReturnValue([mockDevice, mockDevice]);

      const result = repository.create(dtos);

      expect(mockRepository.create).toHaveBeenCalledWith(dtos);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('save', () => {
    it('should save a device entity', async () => {
      mockRepository.save.mockResolvedValue(mockDevice);

      const result = await repository.save(mockDevice);

      expect(mockRepository.save).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual(mockDevice);
    });

    it('should save multiple device entities', async () => {
      const devices = [mockDevice, { ...mockDevice, id: 2 }];
      mockRepository.save.mockResolvedValue(devices);

      const result = await repository.save(devices);

      expect(mockRepository.save).toHaveBeenCalledWith(devices);
      expect(result).toEqual(devices);
    });
  });

  describe('find', () => {
    it('should find all devices', async () => {
      const devices = [mockDevice];
      mockRepository.find.mockResolvedValue(devices);

      const result = await repository.find();

      expect(mockRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(devices);
    });

    it('should find devices with options', async () => {
      const devices = [mockDevice];
      const options = { where: { type: DeviceType.lamp } };
      mockRepository.find.mockResolvedValue(devices);

      const result = await repository.find(options);

      expect(mockRepository.find).toHaveBeenCalledWith(options);
      expect(result).toEqual(devices);
    });
  });

  describe('findOne', () => {
    it('should find one device by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDevice);

      const result = await repository.findOne({ where: { id: 1 } });

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDevice);
    });

    it('should return null when device not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne({ where: { id: 999 } });

      expect(result).toBeNull();
    });
  });

  describe('findAndCount', () => {
    it('should find devices with pagination', async () => {
      const devices = [mockDevice];
      mockRepository.findAndCount.mockResolvedValue([devices, 1]);

      const result = await repository.findAndCount({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([devices, 1]);
    });
  });

  describe('update', () => {
    it('should update devices by criteria', async () => {
      const updateResult = { affected: 1 };
      mockRepository.update.mockResolvedValue(updateResult as any);

      const result = await repository.update({ id: 1 }, { name: 'Updated Name' });

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        { name: 'Updated Name' },
      );
      expect(result.affected).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete devices by criteria', async () => {
      const deleteResult = { affected: 1 };
      mockRepository.delete.mockResolvedValue(deleteResult as any);

      const result = await repository.delete({ id: 1 });

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result.affected).toBe(1);
    });

    it('should return affected 0 when nothing deleted', async () => {
      const deleteResult = { affected: 0 };
      mockRepository.delete.mockResolvedValue(deleteResult as any);

      const result = await repository.delete({ id: 999 });

      expect(result.affected).toBe(0);
    });
  });

  describe('remove', () => {
    it('should remove a device entity', async () => {
      mockRepository.remove.mockResolvedValue(mockDevice);

      const result = await repository.remove(mockDevice);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual(mockDevice);
    });
  });
});

