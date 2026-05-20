import { createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_USER_SLICE } from '../slices/slicesName';
import { TLoginData, TUserResponse } from '@/shared/utils/api';
import { getUserApi, logoutApi } from '@/shared/mocks/authMock';
import { deleteCookie } from '@/shared/utils/cookies';
import { loginUserApi } from '@/api/skillSwapApi';
import { User } from '@/entities/user/model/types';

export const fetchUser = createAsyncThunk<TUserResponse, void>(
  `${AUTH_USER_SLICE}/fetchUser`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserApi();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const loginUser = createAsyncThunk<User, TLoginData, { rejectValue: string }>(
  `${AUTH_USER_SLICE}/loginUser`,
  async (dataUser, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(dataUser);
      return data;
    } catch (error) {
      return rejectWithValue(error as string);
    }
  },
);

export const logoutUserApi = createAsyncThunk(
  `${AUTH_USER_SLICE}/logoutUserApi`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutApi();
      deleteCookie('accessToken');
      localStorage.removeItem('accessToken');
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
