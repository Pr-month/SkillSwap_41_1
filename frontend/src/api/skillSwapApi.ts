import { Skill } from '@/entities/skill/model/types';
import { User } from '@/entities/user/model/types';
import { TServerResponse } from '@/shared/utils/api';
import { getCookie } from '@/shared/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_SKILLSWAP_API_URL || '';
const URL = API_BASE_URL ? `${API_BASE_URL}` : '';

const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then(err => Promise.reject(err));

const assertSuccess = <T>(response: { success: boolean; data: T }, errorText: string) => {
  if (!response.success) throw new Error(errorText);
  return response.data;
};

type SkillResponse = {
  data: Skill[];
  page: number;
  totalPages: number;
};

type UsersResponse = ServerResponse<User[]>;

export const getSkillsApi = async (page?: number, limit?: number, search?: string, category?: string) => {
  const params = new URLSearchParams();
  params.set('page', page ? String(page) : '');
  params.set('limit', limit ? String(limit) : '');
  params.set('search', search ? search : '');
  params.set('category', category ? category : '');
  const res = await fetch(`/skills?${params.toString()}`);
  const checkedRes = await checkResponse<SkillResponse>(res);
  return checkedRes;
};

export const getUsersApi = async () => {
  const res = await fetch(`/users`);
  const checkedRes = await checkResponse<UsersResponse>(res);
  return assertSuccess(checkedRes, 'Не удалось получить данные о пользователях');
};

export type LoginData = {
  email: string;
  password: string;
};

export const loginUserApi = async (data: LoginData) => {
  const res = await fetch(`/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  const checkedRes = await checkResponse<User>(res);
  return checkedRes;
};

export const logoutUserApi = async () => {
  const res = await fetch(`/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  const checkedRes = await checkResponse(res);
  return checkedRes;
}

// Добавляем тип для обновления профиля
export type TUpdateProfileData = {
  name: string;
  birthdate: string;
  gender: 'Мужской' | 'Женский';
  city: string;
  description: string;
  avatar?: string;
};

export type TUpdateProfileResponse = TServerResponse<{
  user: User;
}>;

// Добавляем метод для обновления профиля
export const updateProfileApi = (data: TUpdateProfileData): Promise<TUpdateProfileResponse> => {
  return fetch(`${URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken') || '',
    },
    body: JSON.stringify(data),
  }).then(res => checkResponse<TUpdateProfileResponse>(res));
};

export type ServerResponse<T> = {
  success: boolean;
  data: T;
};
