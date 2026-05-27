import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Category } from '../categories/entities/category.entity';
import { UserRole } from './entities/enums/users.enums';
import { City } from '../cities/entities/city.entity';

const userProfileRelations = {
  skills: true,
  wantToLearn: true,
  favoriteSkills: true,
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { wantToLearn, cityId, role, ...rest } = createUserDto;

    const duplicate = await this.userRepo.findOne({
      where: { email: rest.email },
    });
    if (duplicate) {
      throw new ConflictException('User with this email already exists');
    }

    let city: City | null = null;
    if (cityId) {
      city = await this.cityRepo.findOne({ where: { id: cityId } });
      if (!city) {
        throw new BadRequestException('City not found');
      }
    }

    const user = this.userRepo.create({
      ...rest,
      city,
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
      relations: userProfileRelations,
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

  async findOne(id: string) {
    return this.findById(id);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: userProfileRelations,
    });
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { cityId, ...rest } = dto;
    Object.assign(user, rest);

    if (cityId) {
      const city = await this.cityRepo.findOne({ where: { id: cityId } });
      if (!city) {
        throw new BadRequestException('City not found');
      }
      user.city = city;
    }

    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(user);
  }

  async createCategory(userId: string, categoryId: string): Promise<User> {
    const user = await this.findById(userId);
    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryIsExist = user.wantToLearn?.some((i) => i.id === categoryId);

    if (categoryIsExist) {
      throw new ConflictException('Category already exists for this user');
    }

    user.wantToLearn = [...(user.wantToLearn || []), category];
    return this.userRepo.save(user);
  }

  async removeCategory(userId: string, categoryId: string) {
    const user = await this.findById(userId);
    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    user.wantToLearn = user.wantToLearn.filter((i) => i.id !== categoryId);
    return this.userRepo.save(user);
  }

  async findAllCategories(userId: string): Promise<Category[]> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.wantToLearn;
  }
}
