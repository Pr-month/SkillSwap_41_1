import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  const skillsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeFromFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: skillsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates favorite removal to the service', async () => {
    skillsServiceMock.removeFromFavorite.mockResolvedValue({
      message: 'Навык удален из избранного',
    });

    const result = await controller.removeFromFavorite('skill-1', {
      user: { sub: 'user-1' },
    } as never);

    expect(skillsServiceMock.removeFromFavorite).toHaveBeenCalledWith(
      'skill-1',
      'user-1',
    );
    expect(result).toEqual({ message: 'Навык удален из избранного' });
  });
});
