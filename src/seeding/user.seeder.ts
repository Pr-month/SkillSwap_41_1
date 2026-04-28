import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { appConfig, IAppConfig } from 'src/config/app.config';
import { User } from 'src/users/entities/user.entity';
import { testUsers } from './user.array';

async function seedUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const config: IAppConfig = app.get(appConfig.KEY);

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
    await app.close();
    console.log('Seeding users completed.');
  }
}

void seedUsers();
