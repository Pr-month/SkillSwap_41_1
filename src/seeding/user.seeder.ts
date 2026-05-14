import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { appConfig, IAppConfig } from '../config/app.config';
import { User } from '../users/entities/user.entity';
import { testUsers } from './data/user.array';
import { City } from '../cities/entities/city.entity';

export async function seedUsers(dataSource: DataSource) {
  const config: IAppConfig = appConfig();

  const userRepository = dataSource.getRepository(User);
  const cityRepository = dataSource.getRepository(City);

  for (const userData of testUsers) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`User ${userData.email} already exists, keep going.`);
      continue;
    }

    const city = await cityRepository.findOne({
      where: {
        name: userData.city,
      },
    });

    const user = userRepository.create({
      name: userData.name,
      email: userData.email,
      password: await bcrypt.hash(userData.password, config.hashSalt),
      about: userData.about ?? null,
      birthdate: userData.birthdate ? new Date(userData.birthdate) : null,
      city: city?.name ?? null,
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
}
