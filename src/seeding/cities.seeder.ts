import { City } from '../city/entities/city.entities';
import { DataSource } from 'typeorm';
import { citiesData } from './cities.array';
import { dbConfig } from '../config/db.config';

async function seedCities() {
  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();

    const cityRepository = dataSource.getRepository(City);

    const cities = citiesData.map((city) => ({
      name: city.name,
      district: city.district,
      subject: city.subject,
      population: Number(city.population),
      coords: {
        lat: Number(city.coords.lat),
        lon: Number(city.coords.lon),
      },
    }));

    await cityRepository.upsert(cities, {
      conflictPaths: ['name', 'subject'],
      skipUpdateIfNoValuesChanged: true,
    });

    console.log(`Seeded cities: ${cities.length}`);
  } catch (error) {
    console.error('Error seeding cities:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    console.log('Seeding cities completed.');
  }
}

void seedCities();
