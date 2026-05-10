import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

describe('CitiesController', () => {
  let controller: CitiesController;
  const citiesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: citiesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates city search to the service', async () => {
    citiesServiceMock.findAll.mockResolvedValue([{ id: '1', name: 'Berlin' }]);

    const result = await controller.findAll({ search: 'ber' });

    expect(citiesServiceMock.findAll).toHaveBeenCalledWith({ search: 'ber' });
    expect(result).toEqual([{ id: '1', name: 'Berlin' }]);
  });

  it('delegates city update to the service', async () => {
    citiesServiceMock.update.mockResolvedValue({ id: '1', name: 'Lyon' });

    const result = await controller.update('1', { name: 'Lyon' });

    expect(citiesServiceMock.update).toHaveBeenCalledWith('1', {
      name: 'Lyon',
    });
    expect(result).toEqual({ id: '1', name: 'Lyon' });
  });
});
