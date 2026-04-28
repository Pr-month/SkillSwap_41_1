import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { appConfig, IAppConfig } from '../config/app.config';
import { User } from '../users/entities/user.entity';
import { testUsers } from './user.array';
import { dbConfig } from '../config/db.config';

async function seedUsers() {
  const dataSource = new DataSource(dbConfig());
  const config: IAppConfig = appConfig();

  try {
    const userRepository = dataSource.getRepository(User);

    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, keep going.`);
        continue;
      }

      const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        password: await bcrypt.hash(userData.password, config.hashSalt),
        about: userData.about ?? null,
        birthdate: userData.birthdate ? new Date(userData.birthdate) : null,
        city: userData.city ?? null,
        gender: userData.gender ?? null,
        avatar: null,
        role: userData.role,
        refreshToken: null,
        skills: [],
        wantToLearn: [],
        favoriteSkills: [],
      });
      await userRepository.save(user);
      console.log(`User ${userData.email} created.`);
    }

    const totalUsers = await userRepository.count();
    console.log(`Total created users: ${totalUsers}`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('Seeding users completed.');
  }
}

void seedUsers();
