import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  let service: SkillsService;
  const skillsRepositoryMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
  };
  const categoriesRepositoryMock = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
  };
  const usersRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepositoryMock as unknown as Partial<
            Repository<Skill>
          >,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepositoryMock as unknown as Partial<
            Repository<Category>
          >,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock as unknown as Partial<Repository<User>>,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('removes a skill from favorites for the current user', async () => {
    usersRepositoryMock.findOne.mockResolvedValue({
      id: 'user-1',
      favoriteSkills: [{ id: 'skill-1' }],
    });
    skillsRepositoryMock.findOne.mockResolvedValue({ id: 'skill-1' });
    usersRepositoryMock.save.mockResolvedValue({});

    const result = await service.removeFromFavorite('skill-1', 'user-1');

    expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      relations: { favoriteSkills: true },
    });
    expect(usersRepositoryMock.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Навык удален из избранного' });
  });
});
