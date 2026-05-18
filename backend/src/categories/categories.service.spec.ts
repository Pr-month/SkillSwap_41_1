import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IsNull } from 'typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const mockRepository = {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository as unknown as Partial<Repository<Category>>,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCategoryDto = { name: 'Test Category' };
    const createdCategory = {
      id: '1',
      name: 'Test Category',
      parent: null,
      children: [],
    };

    it('Сервис должен создать корневую категорию', async () => {
      mockRepository.create.mockReturnValue(createdCategory);
      mockRepository.save.mockResolvedValue(createdCategory);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createCategoryDto.name,
        parent: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual(createdCategory);
    });

    it('Сервис должен создать дочернюю категорию с родителем', async () => {
      const parentCategory = { id: 'parent-1', name: 'Parent Category' };
      const childDto = { name: 'Child Category', parentId: 'parent-1' };
      const childCategory = {
        id: '2',
        name: 'Child Category',
        parent: parentCategory,
        children: [],
      };

      mockRepository.findOne.mockResolvedValue(parentCategory);
      mockRepository.create.mockReturnValue(childCategory);
      mockRepository.save.mockResolvedValue(childCategory);

      const result = await service.create(childDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'parent-1' },
      });
      expect(result).toEqual(childCategory);
    });

    it('Сервис должен выдать NotFoundException когда родитель не найден', async () => {
      const childDto = { name: 'Child Category', parentId: 'non-existent' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(childDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(childDto)).rejects.toThrow(
        'Parent category not found',
      );
    });
  });

  describe('findAll', () => {
    it('Сервис должен вернуть все корневые категории с потомками', async () => {
      const rootCategories = [
        { id: '1', name: 'Category 1', parent: null, children: [] },
        { id: '2', name: 'Category 2', parent: null, children: [] },
      ];

      mockRepository.find.mockResolvedValue(rootCategories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });

      expect(result).toEqual(rootCategories);
    });

    it('Сервис должен вернуть пустой массив когда категорий нет', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const existingCategory = {
      id: '1',
      name: 'Original Name',
      parent: null,
      children: [],
    };

    it('Сервис должен обновить название категории', async () => {
      const updateDto = { name: 'New Name' };
      const updatedCategory = { ...existingCategory, name: 'New Name' };

      mockRepository.findOne.mockResolvedValue(existingCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update('1', updateDto);

      expect(existingCategory.name).toBe('New Name');
      expect(mockRepository.save).toHaveBeenCalledWith(existingCategory);
      expect(result).toEqual(updatedCategory);
    });

    it('Сервис должен обновить родителя категории', async () => {
      const newParent = { id: 'parent-1', name: 'New Parent' };
      const updateDto = { parentId: 'parent-1' };
      const updatedCategory = { ...existingCategory, parent: newParent };

      mockRepository.findOne
        .mockResolvedValueOnce(existingCategory)
        .mockResolvedValueOnce(newParent);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update('1', updateDto);

      expect(existingCategory.parent).toEqual(newParent);
      expect(mockRepository.save).toHaveBeenCalledWith(existingCategory);
      expect(result).toEqual(updatedCategory);
    });

    it('Сервис должен выдать BadRequestException когда категория является своим собственным родителем', async () => {
      const updateDto = { parentId: '1' };

      mockRepository.findOne.mockResolvedValue(existingCategory);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('1', updateDto)).rejects.toThrow(
        'Can not be own parent',
      );
    });

    it('Сервис должен выдать NotFoundException когда категория не найдена', async () => {
      const updateDto = { name: 'New Name' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('remove', () => {
    const existingCategory = {
      id: '1',
      name: 'Category',
      parent: null,
      children: [],
    };

    it('Сервис должен успешно удалить категорию', async () => {
      mockRepository.findOne.mockResolvedValue(existingCategory);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ affected: 1 });
    });

    it('Сервис должен выдать BadRequestException когда у категории есть потомки', async () => {
      mockRepository.findOne.mockResolvedValue(existingCategory);
      mockRepository.count.mockResolvedValue(1);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
      await expect(service.remove('1')).rejects.toThrow(
        'Category has children',
      );
    });

    it('Сервис должен выдать NotFoundException когда категория не найдена', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent')).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
