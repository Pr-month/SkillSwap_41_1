import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

describe('SkillsService', () => {
  let service: SkillsService;

  const mockSkillsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoriesRepository = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillsRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoriesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    jest.clearAllMocks();
  });

  it('Сервис должен существовать', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createSkillDto = {
      title: 'Test Skill',
      description: 'Test Description',
      categoryId: 'category-uuid-1',
      images: ['image1.jpg'],
    };
    const ownerId = 'user-uuid-1';
    const category = {
      id: 'category-uuid-1',
      name: 'Test Category',
    };
    const createdSkill = {
      id: 'skill-uuid-1',
      title: 'Test Skill',
      description: 'Test Description',
      category,
      owner: { id: ownerId },
      images: ['image1.jpg'],
    };

    it('Сервис должен создать навык', async () => {
      mockCategoriesRepository.findOne.mockResolvedValue(category);
      mockSkillsRepository.create.mockReturnValue(createdSkill);
      mockSkillsRepository.save.mockResolvedValue(createdSkill);

      const result = await service.create(createSkillDto, ownerId);

      expect(mockCategoriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: createSkillDto.categoryId },
      });
      expect(mockSkillsRepository.create).toHaveBeenCalledWith({
        title: createSkillDto.title,
        description: createSkillDto.description,
        images: createSkillDto.images,
        category,
        owner: { id: ownerId },
      });
      expect(mockSkillsRepository.save).toHaveBeenCalledWith(createdSkill);
      expect(result).toEqual(createdSkill);
    });

    it('Сервис должен выбросить NotFoundException когда категория не найдена', async () => {
      mockCategoriesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createSkillDto, ownerId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createSkillDto, ownerId)).rejects.toThrow(
        'Категория не найдена',
      );
    });

    it('Сервис должен создать навык без описания', async () => {
      const dtoWithoutDescription = {
        title: 'Test Skill',
        categoryId: 'category-uuid-1',
      };
      const skillWithoutDescription = {
        ...createdSkill,
        description: null,
        images: [],
      };

      mockCategoriesRepository.findOne.mockResolvedValue(category);
      mockSkillsRepository.create.mockReturnValue(skillWithoutDescription);
      mockSkillsRepository.save.mockResolvedValue(skillWithoutDescription);

      const result = await service.create(dtoWithoutDescription, ownerId);

      expect(result.description).toBeNull();
      expect(result.images).toEqual([]);
    });
  });

  describe('findAll', () => {
    const skills = [
      { id: '1', title: 'Skill 1' },
      { id: '2', title: 'Skill 2' },
    ];

    it('Сервис должен вернуть все навыки с пагинацией', async () => {
      mockSkillsRepository.findAndCount.mockResolvedValue([skills, 2]);

      const result = await service.findAll({ page: 1, limit: 20, search: '' });

      expect(mockSkillsRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual(skills);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('Сервис должен вернуть пустой массив когда навыков нет', async () => {
      mockSkillsRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({ page: 1, limit: 20, search: '' });

      expect(result.data).toEqual([]);
      expect(result.totalPages).toBe(0);
    });

    it('Сервис должен выбросить NotFoundException когда страница не найдена', async () => {
      mockSkillsRepository.findAndCount.mockResolvedValue([skills, 2]);

      await expect(
        service.findAll({ page: 10, limit: 20, search: '' }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findAll({ page: 10, limit: 20, search: '' }),
      ).rejects.toThrow('Page not found');
    });

    it('Сервис должен корректно вычислить общее количество страниц', async () => {
      mockSkillsRepository.findAndCount.mockResolvedValue([skills, 25]);

      const result = await service.findAll({ page: 1, limit: 10, search: '' });

      expect(result.totalPages).toBe(3);
    });
  });

  describe('findOne', () => {
    const skill = {
      id: 'skill-uuid-1',
      title: 'Test Skill',
      owner: { id: 'user-uuid-1' },
      category: { id: 'category-uuid-1', name: 'Test Category' },
    };

    it('Сервис должен вернуть навык по ID', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(skill);

      const result = await service.findOne('skill-uuid-1');

      expect(mockSkillsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'skill-uuid-1' },
        relations: {
          owner: true,
          category: true,
        },
      });
      expect(result).toEqual(skill);
    });

    it('Сервис должен выбросить NotFoundException когда навык не найден', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Навык не найден',
      );
    });
  });

  describe('update', () => {
    const existingSkill = {
      id: 'skill-uuid-1',
      title: 'Original Title',
      description: 'Original Description',
      owner: { id: 'user-uuid-1' },
      category: { id: 'category-uuid-1', name: 'Original Category' },
    };

    it('Сервис должен обновить навык', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedSkill = { ...existingSkill, title: 'Updated Title' };

      mockSkillsRepository.findOneOrFail.mockResolvedValue(existingSkill);
      mockSkillsRepository.save.mockResolvedValue(updatedSkill);

      const result = await service.update(
        'skill-uuid-1',
        updateDto,
        'user-uuid-1',
      );

      expect(mockSkillsRepository.save).toHaveBeenCalledWith(existingSkill);
      expect(result.title).toBe('Updated Title');
    });

    it('Сервис должен выбросить ForbiddenException когда пользователь не владелец', async () => {
      const updateDto = { title: 'Updated Title' };

      mockSkillsRepository.findOneOrFail.mockResolvedValue(existingSkill);

      await expect(
        service.update('skill-uuid-1', updateDto, 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('skill-uuid-1', updateDto, 'other-user-id'),
      ).rejects.toThrow('Insufficient rights');
    });

    it('Сервис должен обновить категорию навыка', async () => {
      const newCategory = {
        id: 'new-category-uuid-1',
        name: 'New Category',
      };
      const updateDto = { categoryId: 'new-category-uuid-1' };

      mockSkillsRepository.findOneOrFail.mockResolvedValue(existingSkill);
      mockCategoriesRepository.findOneOrFail.mockResolvedValue(newCategory);
      mockSkillsRepository.save.mockResolvedValue({
        ...existingSkill,
        category: newCategory,
      });

      const result = await service.update(
        'skill-uuid-1',
        updateDto,
        'user-uuid-1',
      );

      expect(mockCategoriesRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 'new-category-uuid-1' },
      });
      expect(result.category).toEqual(newCategory);
    });
  });

  describe('remove', () => {
    const existingSkill = {
      id: 'skill-uuid-1',
      title: 'Test Skill',
      owner: { id: 'user-uuid-1' },
      images: ['image1.jpg', 'image2.jpg'],
    };

    it('Сервис должен удалить навык', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(existingSkill);
      mockSkillsRepository.remove.mockResolvedValue(existingSkill);

      const result = await service.remove('skill-uuid-1', 'user-uuid-1');

      expect(mockSkillsRepository.remove).toHaveBeenCalledWith(existingSkill);
      expect(result).toEqual({ message: 'Навык удален' });
    });

    it('Сервис должен выбросить ForbiddenException когда пользователь не владелец', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(existingSkill);

      await expect(
        service.remove('skill-uuid-1', 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.remove('skill-uuid-1', 'other-user-id'),
      ).rejects.toThrow('Вы не можете удалить этот навык');
    });

    it('Сервис должен выбросить NotFoundException когда навык не найден', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.remove('non-existent', 'user-uuid-1'),
      ).rejects.toThrow('Навык не найден');
    });
  });

  describe('addToFavorite', () => {
    const skill = {
      id: 'skill-uuid-1',
      title: 'Test Skill',
    };
    const user = {
      id: 'user-uuid-1',
      username: 'testuser',
      favoriteSkills: [],
    };

    it('Сервис должен добавить навык в избранное', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(skill);
      mockUsersRepository.findOne.mockResolvedValue(user);
      mockUsersRepository.save.mockResolvedValue({
        ...user,
        favoriteSkills: [skill],
      });

      const result = await service.addToFavorite('skill-uuid-1', 'user-uuid-1');

      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result.favoriteSkills).toContain(skill);
    });

    it('Сервис должен выбросить NotFoundException когда навык не найден', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToFavorite('non-existent', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.addToFavorite('non-existent', 'user-uuid-1'),
      ).rejects.toThrow('Skill not found');
    });

    it('Сервис должен выбросить NotFoundException когда пользователь не найден', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(skill);
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addToFavorite('skill-uuid-1', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.addToFavorite('skill-uuid-1', 'non-existent'),
      ).rejects.toThrow('User not found');
    });

    it('Сервис должен выбросить ConflictException когда навык уже в избранном', async () => {
      const userWithFavorite = {
        ...user,
        favoriteSkills: [skill],
      };

      mockSkillsRepository.findOne.mockResolvedValue(skill);
      mockUsersRepository.findOne.mockResolvedValue(userWithFavorite);

      await expect(
        service.addToFavorite('skill-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.addToFavorite('skill-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow('Skill is already in favorites');
    });
  });

  describe('getSimilarUsersForSkill', () => {
    const skillId = 'skill-uuid-similar';
    const skill = {
      id: skillId,
      category: { id: 'category-uuid-1' },
      owner: { id: 'user-uuid-owner' },
    } as Skill;

    it('Сервис должен вызывать findOne и find', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(skill);
      mockUsersRepository.find.mockResolvedValue([]);

      await service.getSimilarUsersForSkill(skillId);

      expect(mockSkillsRepository.findOne).toHaveBeenCalled();
      expect(mockUsersRepository.find).toHaveBeenCalled();
    });

    it('Сервис должен вернуть результат find пользователей', async () => {
      const users = [{ id: 'user-uuid-2' } as User];
      mockSkillsRepository.findOne.mockResolvedValue(skill);
      mockUsersRepository.find.mockResolvedValue(users);

      await expect(service.getSimilarUsersForSkill(skillId)).resolves.toEqual(
        users,
      );
    });

    it('Сервис должен выбросить NotFound если навык не найден', async () => {
      mockSkillsRepository.findOne.mockResolvedValue(null);

      await expect(service.getSimilarUsersForSkill(skillId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
