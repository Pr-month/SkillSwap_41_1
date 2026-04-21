import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from 'src/repository/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './../categories/entities/category.entity';
import { Skill } from './../skills/entities/skill.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Skill])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
