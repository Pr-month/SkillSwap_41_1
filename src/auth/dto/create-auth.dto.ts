import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/entities/enums/users.enums';
import { Skill } from './../../skills/entities/skill.entity';
import { Category } from '../../categories/entities/category.entity';

export class CreateAuthDto {
  @MinLength(2)
  name: string;
  @IsEmail()
  email: string;
  @MinLength(8)
  @MaxLength(16)
  password: string;
  @IsNotEmpty()
  about: string;
  @IsDate()
  birthday: Date;
  @IsNotEmpty()
  city: string;
  @IsNotEmpty()
  @IsIn(['MALE', 'FEMALE'])
  gender: Gender;
  avatar: string;
  wantToLearn: Category;
  skills: Skill;
}
