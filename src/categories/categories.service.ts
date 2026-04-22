import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      parent = await this.categoryRepository.findOne({
        where: {
          id: parentId,
        },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name, parentId } = updateCategoryDto;
    const category = await this.categoryRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (name) {
      category.name = name;
    }

    if (parentId) {
      if (parentId === id) {
        throw new BadRequestException('Can not be own parent');
      }
      const parent = await this.getParentByParentId(parentId)

      category.parent = parent
    }

  const result = await this.categoryRepository.save(category);

  return result
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }

  private async getParentByParentId (parentId: string ) {
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
}
