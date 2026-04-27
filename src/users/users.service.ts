import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return this.userRepo.find({
      relations: {
        skills: true,
        wantToLearn: true,
        favoriteSkills: true,
      },
    });
  }

  findOne(id: string) {
    return this.usersRepository.findById(id);
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
      throw new NotFoundException('Пользователь не найден');
    }

    Object.assign(user, dto);

    return this.userRepo.save(user);
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
