import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
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
      throw new Error('Пользователь не найден');
    }

    Object.assign(user, dto);

    return this.repository.save(user);
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.password = password;

    return this.repository.save(user);
  }
}
