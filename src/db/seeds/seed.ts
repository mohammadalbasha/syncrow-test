import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../auth/repository/user.model';
import { hashPassword } from 'src/auth/utils/password';


async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    const userRepository = AppDataSource.getRepository(User);
//   await userRepository.deleteAll();
    const ensureUser = async (
      username: string,
      password: string,
      role: UserRole,
    ) => {
      const existing = await userRepository.findOne({ where: { username } });
      if (!existing) {
        const hashed = await hashPassword(password);
        const user = userRepository.create({ username, password: hashed, role });
        await userRepository.save(user);
        console.log(`✓ Created user: ${username} (${role})`);
      } else {
        console.log(` User already exists: ${username}`);
      }
    };
 

    await ensureUser('admin', 'admin123', UserRole.admin);
    await ensureUser('mohammad', 'password123', UserRole.user);

    console.log('Seeding completed successfully');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    // Close DataSource connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

void bootstrap();
