import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedAdmin } from './admin.seeder';
import { seedCategories } from './categories.seeder';
import { seedCities } from './cities.seeder';

async function runProdSeeder() {
  console.log('Starting PROD database seeding');

  console.log(`Using database: ${process.env.DB_NAME}`);
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
void runProdSeeder().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
