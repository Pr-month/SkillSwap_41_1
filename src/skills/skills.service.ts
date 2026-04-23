import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateSkillDto, ownerId: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) throw new NotFoundException('Категория не найдена');

    const skill = this.skillsRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      images: dto.images ?? [],
      category,
      owner: { id: ownerId } as User,
    });

    return this.skillsRepository.save(skill);
  }
}
