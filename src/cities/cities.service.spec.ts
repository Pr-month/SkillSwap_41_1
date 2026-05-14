import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CitiesService } from './cities.service';
import { NotFoundException } from '@nestjs/common';

describe('CitiesService', () => {
  let service: CitiesService;
  const cityRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: cityRepositoryMock as unknown as Partial<Repository<City>>,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns cities sorted by name without search', async () => {
    cityRepositoryMock.find.mockResolvedValue([{ id: 1, name: 'Berlin' }]);

    const result = await service.findAll({ search: '' });

    expect(cityRepositoryMock.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
    expect(result).toEqual([{ id: 1, name: 'Berlin' }]);
  });

  it('filters cities by search query', async () => {
    cityRepositoryMock.find.mockResolvedValue([{ id: 1, name: 'Paris' }]);

    const result = await service.findAll({ search: 'par' });

    expect(cityRepositoryMock.find).toHaveBeenCalledWith({
      where: expect.objectContaining({ name: expect.any(Object) }),
      order: { name: 'ASC' },
    });
    expect(result).toEqual([{ id: 1, name: 'Paris' }]);
  });

  it('updates an existing city', async () => {
    cityRepositoryMock.findOneBy.mockResolvedValue({ id: 1, name: 'Paris' });
    cityRepositoryMock.save.mockResolvedValue({ id: 1, name: 'Lyon' });

    const result = await service.update(1, { name: 'Lyon' });

    expect(cityRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(cityRepositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      name: 'Lyon',
    });
    expect(result).toEqual({ id: 1, name: 'Lyon' });
  });

  it('throws when city is not found during update', async () => {
    cityRepositoryMock.findOneBy.mockResolvedValue(null);

    await expect(service.update(1, { name: 'Lyon' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
