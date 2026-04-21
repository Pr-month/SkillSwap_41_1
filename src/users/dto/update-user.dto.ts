import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from '../entities/enums/users.enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;
}
