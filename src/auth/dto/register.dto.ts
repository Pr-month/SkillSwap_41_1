import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/entities/enums/users.enums';

export class RegisterDto {
  @MinLength(2)
  name: string;
  @IsEmail()
  email: string;
  @MinLength(8)
  @MaxLength(16)
  password: string;
  @IsNotEmpty()
  about: string;
  @IsDateString()
  birthdate: Date;
  @IsNotEmpty()
  city: string;
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;
  @IsOptional()
  @IsString()
  avatar: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wantToLearn: string[];
}
