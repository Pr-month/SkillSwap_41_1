import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return this.usersRepository.findById(id);
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.usersRepository.updateMe(userId, dto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
