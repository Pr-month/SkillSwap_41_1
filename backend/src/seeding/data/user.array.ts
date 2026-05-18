import { Gender, UserRole } from '../../users/entities/enums/users.enums';

export const testUsers = [
  {
    name: 'Анна Петрова',
    email: 'anna.petrova@test.com',
    password: 'user123456',
    about: 'Люблю танцевать сальсу и изучать новые рецепты',
    birthdate: '1995-06-15',
    city: 'Москва',
    gender: Gender.FEMALE,
    role: UserRole.USER,
  },
  {
    name: 'Дмитрий Соколов',
    email: 'dmitry.sokolov@test.com',
    password: 'user654321',
    about: 'Разработчик, увлекаюсь бегом и настольными играми',
    birthdate: '1990-11-22',
    city: 'Санкт-Петербург',
    gender: Gender.MALE,
    role: UserRole.USER,
  },
];
