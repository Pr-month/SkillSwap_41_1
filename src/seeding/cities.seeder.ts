import { City } from 'src/city/entities/city.entities';
import { DataSource } from 'typeorm';
import { citiesData } from './data/cities.array';

export async function seedCities(dataSource: DataSource) {
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
}
