import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { appConfig, IAppConfig } from '../config/app.config';
import { UserRole } from '../users/entities/enums/users.enums';
import { User } from '../users/entities/user.entity';

export async function seedAdmin(dataSource: DataSource) {
  const config: IAppConfig = appConfig();

  try {
    await dataSource.initialize();
    const userRepository = dataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: process.env.ADMIN_EMAIL || 'admin@admin.com' },
    });
    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'admin123456',
      config.hashSalt,
    );

    const admin = userRepository.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@admin.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      refreshToken: null,
    });
    await userRepository.save(admin);
    console.log('Admin created with email:', admin.email);
  } catch (error) {
    console.error('Error seeding admin:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('Seeding admin complete.');
  }
}