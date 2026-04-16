import {
  IsArray,
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @MinLength(2)
  name: string;
  @IsEmail()
  email: string;
  @MinLength(8)
  @MaxLength(16)
  password: string;
  @IsDate()
  birthday: Date;
  @IsNotEmpty()
  city: string;
  @IsNotEmpty()
  @IsIn(['мужской', 'женский'])
  gender: string;
  avatar: string;
  @IsNumber()
  wantToLearnCategory: number;
  @IsNumber()
  wantToLearnSubcategory: number;
  skillName: string;
  @IsNumber()
  skillCategory: number;
  @IsNumber()
  skillSubcategory: number;
  @IsNotEmpty()
  about: string;
  @IsArray()
  images: string[];
}
