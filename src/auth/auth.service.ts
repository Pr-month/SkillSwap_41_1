import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './../users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createAuthDto: CreateAuthDto): Promise<CreateUserDto> {
    const userExists = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const password = await bcrypt.hash(createAuthDto.password, 10);
    const user = this.userRepository.create({ ...createAuthDto, password });
    return this.userRepository.save(user);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  /*  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  } */

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

