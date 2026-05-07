import { Gender, UserRole } from '../entities/enums/users.enums';

export class CreateUserDto {
  name!: string;
  email!: string;
  password?: string;
  about?: string;
  birthdate?: Date;
  city?: string;
  gender?: Gender;
  avatar?: string;
  role?: UserRole;
  wantToLearn?: string[];
}
