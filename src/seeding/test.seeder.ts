import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedCategories } from './categories.seeder';
import { seedAdmin } from './admin.seeder';
import { seedCities } from './cities.seeder';
import { seedUsers } from './user.seeder';
import { seedSkills } from './skills.seeder';

async function runTestSeeder() {
  console.log('Run test seeding...');
  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Database connected.');

    await seedCategories(dataSource);
    console.log('Categories seeded.');

    await seedCities(dataSource);
    console.log('Cities seeded.');

    await seedAdmin(dataSource);
    console.log('Admin seeded.');

    await seedUsers(dataSource);
    console.log('Users seeded.');

    await seedSkills(dataSource);
    console.log('Skills seeded.');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}
void runTestSeeder().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
