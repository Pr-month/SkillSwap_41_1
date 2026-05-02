import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsQueryDto } from './dto/GetSkillsQueryDto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  async findAll(query: GetSkillsQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.skillsRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      totalPages,
    };
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

  async remove(id: string, userId: string) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!skill) {
      throw new NotFoundException('Навык не найден');
    }

    if (skill.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить этот навык');
    }

    for (const image of skill.images) {
      const filePath = join(process.cwd(), image);
      await fs.unlink(filePath).catch(() => null);
    }

    await this.skillsRepository.remove(skill);
    return { message: 'Навык удален' };
  }

  async addToFavorite(id: string, userId: string) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { favoriteSkills: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyFavorite = user.favoriteSkills.some(
      (favoriteSkill) => favoriteSkill.id === skill.id,
    );

    if (isAlreadyFavorite) {
      throw new ConflictException('Skill is already in favorites');
    }

    user.favoriteSkills.push(skill);

    return this.usersRepository.save(user);
  }
}
