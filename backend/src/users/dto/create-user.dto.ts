import {
  IsOptional,
  IsString,
  IsEnum,
  IsDate,
  IsInt,
  IsEmail,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Gender, UserRole } from '../entities/enums/users.enums';

export class CreateUserDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(256)
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  about?: string;

  @IsOptional()
  @IsDate()
  birthdate?: Date;

  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsString()
  @IsOptional()
  @MaxLength(256)
  avatar?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wantToLearn?: string[];
}
