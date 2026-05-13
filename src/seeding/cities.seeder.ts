import { DataSource } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { citiesData } from './cities.array';

export async function seedCities(dataSource: DataSource) {

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