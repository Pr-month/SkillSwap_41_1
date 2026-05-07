import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/enums/users.enums';
import { appConfig, IAppConfig } from '../config/app.config';

export async function seedAdmin(dataSource: DataSource) {
  const config: IAppConfig = appConfig();

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
}
