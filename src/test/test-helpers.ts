import { DataSource } from 'typeorm';
import { User, UserRole } from '../auth/repository/user.model';
import { Device } from '../device/repository/device.model';
import { RefreshToken } from '../auth/repository/refresh-token.model';
import { hashPassword } from '../auth/utils/password';

export async function clearDatabase(dataSource: DataSource) {
  const entities = [RefreshToken, Device, User]; // Delete in reverse order of dependencies
  
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity);
    // Use query builder to delete all records (TypeORM doesn't allow delete({}))
    await repository.createQueryBuilder().delete().execute();
  }
}

export async function createTestUser(
  dataSource: DataSource,
  username: string = 'testuser',
  password: string = 'testpass123',
  role: UserRole = UserRole.user,
) {
  const userRepository = dataSource.getRepository(User);
  const hashedPassword = await hashPassword(password);
  const user = userRepository.create({
    username,
    password: hashedPassword,
    role,
  });
  return await userRepository.save(user);
}

export async function createTestDevice(
  dataSource: DataSource,
  name: string = 'Test Device',
  type: string = 'lamp',
  location?: string,
) {
  const deviceRepository = dataSource.getRepository(Device);
  const device = deviceRepository.create({
    name,
    type: type as any,
    location,
  });
  return await deviceRepository.save(device);
}

export async function clearDevices(dataSource: DataSource) {
  const deviceRepository = dataSource.getRepository(Device);
  await deviceRepository.createQueryBuilder().delete().execute();
}
