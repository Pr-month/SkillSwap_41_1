import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput } from './users.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Category } from '../categories/entities/category.entity';
import { UserRole } from './entities/enums/users.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(createUserDto: CreateUserInput): Promise<User> {
    const { wantToLearn, role, ...rest } = createUserDto;

    const duplicate = await this.userRepo.findOne({
      where: { email: rest.email },
    });
    if (duplicate) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepo.create({
      ...rest,
      role: role ?? UserRole.USER,
    });

    if (wantToLearn?.length) {
      const categories = await this.categoryRepo.findBy({
        id: In(wantToLearn),
      });
      if (categories.length !== wantToLearn.length) {
        throw new BadRequestException(
          'One or more categories not found or invalid',
        );
      }
      user.wantToLearn = categories;
    }

    return this.userRepo.save(user);
  }

  async findAll(query: GetUsersQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepo.findAndCount({
      skip,
      take: limit,
      relations: {
        skills: true,
        wantToLearn: true,
        favoriteSkills: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    const lastPage = total === 0 ? 1 : totalPages;

    if (page > lastPage) {
      throw new NotFoundException('Page not found');
    }

    return {
      data,
      page,
      totalPages: lastPage,
    };
  }

  findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: {
        skills: true,
        wantToLearn: true,
        favoriteSkills: true,
      },
    });
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);

    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(user);
  }
}
