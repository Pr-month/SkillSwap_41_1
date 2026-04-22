import { Injectable, NotFoundException } from '@nestjs/common';
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

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
