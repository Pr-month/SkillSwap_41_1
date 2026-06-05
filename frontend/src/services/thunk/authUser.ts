import { createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_USER_SLICE } from '../slices/slicesName';
import { TLoginData } from '@/shared/utils/api';
import { getUserApi, loginUserApi, logoutUserApi } from '@/api/skillSwapApi';
import { User } from '@/entities/user/model/types';

export const fetchUser = createAsyncThunk<User, void>(
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

export const loginUser = createAsyncThunk<User, TLoginData>(
  `${AUTH_USER_SLICE}/loginUser`,
  async (dataUser, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(dataUser);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const logoutUser = createAsyncThunk(
  `${AUTH_USER_SLICE}/logoutUserApi`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutUserApi();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
