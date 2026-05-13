import { City } from '../cities/entities/city.entity';
import { DataSource } from 'typeorm';
import { citiesData } from './data/cities.array';

export async function seedCities(dataSource: DataSource) {
  const cityRepository = dataSource.getRepository(City);

  const cities = citiesData.map((city) => ({
    name: city.name,
  }));

  await cityRepository.save(cities);

  console.log(`Seeded cities: ${cities.length}`);
}
