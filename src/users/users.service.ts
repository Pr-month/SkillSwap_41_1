import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly usersRepository: UsersRepository,
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.usersRepository.updateMe(userId, dto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
