import { Injectable, NotFoundException } from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCityDto } from './dto/create-city.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}
  async create(createCityDto: CreateCityDto) {
    const city = this.cityRepository.create(createCityDto);
    return this.cityRepository.save(city);
  }

  async findAll(query: GetCitiesQueryDto) {
    const search = query.search?.trim();

    return this.cityRepository.find(
      search
        ? {
            where: { name: ILike(`%${search}%`) },
            order: { name: 'ASC' },
          }
        : {
            order: { name: 'ASC' },
          },
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findOneBy({ id });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    Object.assign(city, updateCityDto);

    return this.cityRepository.save(city);
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
