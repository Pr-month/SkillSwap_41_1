import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSkillDto } from './dto/update-skill.dto';

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

  findAll() {
    return `This action returns all skills`;
  }

  findOne(id: string) {
    return `This action returns a #${id} skill`;
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    userId: string,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['owner', 'category'],
    });

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Insufficient rights');
    }

    const { categoryId, ...rest } = updateSkillDto;

    if (categoryId !== undefined) {
      skill.category = await this.categoriesRepository.findOneOrFail({
        where: { id: categoryId },
      });
    }

    Object.assign(skill, rest);

    return this.skillsRepository.save(skill);
  }

  remove(id: string) {
    return `This action removes a #${id} skill`;
  }
}
