import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { appConfig, IAppConfig } from '../config/app.config';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(appConfig.KEY)
    private readonly configService: IAppConfig,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.usersRepository.updateMe(userId, dto);
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is invalid');
    }

    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      this.configService.hashSalt,
    );

    await this.usersRepository.updatePassword(userId, hashedPassword);

    return { message: 'Password updated successfully' };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
