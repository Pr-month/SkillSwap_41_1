import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;
    let parent: Category | null = null;

    if (parentId) {
      parent = await this.getParentByParentId(parentId);
    }

    const newCategory = this.categoryRepository.create({
      name: name,
      parent: parent,
    });

    const result = await this.categoryRepository.save(newCategory);

    return result;
  }

  async findAll() {
    const result = await this.categoryRepository.find({
      where: {
        parent: IsNull(),
      },
      relations: ['children'],
    });

    return result;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, parentId } = updateCategoryDto;
    const category = await this.findCategoryById(id);

    if (name) {
      category.name = name;
    }

    if (parentId) {
      if (parentId === id) {
        throw new BadRequestException('Can not be own parent');
      }
      const parent = await this.getParentByParentId(parentId);

      category.parent = parent;
    }

    const result = await this.categoryRepository.save(category);

    return result;
  }

  async remove(id: string) {
    const category = await this.findCategoryById(id);

    // не удаляем категорию, если у нее есть дочерние категории.
    const childrenCount = await this.categoryRepository.count({
      where: { parent: { id: category.id } },
    });
    // просто выкидываем ошибку, возможно, нужна другая логика
    if (childrenCount > 0) {
      throw new BadRequestException('Category has children');
    }

    const result = await this.categoryRepository.delete(category.id);

    return result;
  }

  private async getParentByParentId(parentId: string) {
    const parent = await this.categoryRepository.findOne({
      where: {
        id: parentId,
      },
    });
    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }
    return parent;
  }

  private async findCategoryById(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
