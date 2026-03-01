import client from './client';
import { LoginResponse, Author } from './types';

export const login = (email: string, password: string) =>
  client.post<LoginResponse>('/auth/login', { email, password });

export const getMe = () =>
  client.get<Author>('/auth/me');

export const logout = () =>
  client.post('/auth/logout');
