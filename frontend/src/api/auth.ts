// =============================================================================
// Guttenberg Auth API
// SimpleJWT authentication against the Django backend.
// =============================================================================

import client from './client';
import { AuthTokens, User } from './types';

/**
 * Authenticate a user with username and password.
 * Stores the JWT pair in localStorage upon success.
 */
export const login = async (
  username: string,
  password: string,
): Promise<AuthTokens> => {
  const { data } = await client.post<AuthTokens>('/auth/login/', {
    username,
    password,
  });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
};

/**
 * Obtain a new access token using the stored refresh token.
 */
export const refreshToken = async (): Promise<{ access: string }> => {
  const refresh = localStorage.getItem('refresh_token');
  const { data } = await client.post<{ access: string }>('/auth/refresh/', {
    refresh,
  });
  localStorage.setItem('access_token', data.access);
  return data;
};

/**
 * Register a new user account.
 */
export const register = async (data: {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}): Promise<User> => {
  const response = await client.post<User>('/auth/register/', data);
  return response.data;
};

/**
 * Retrieve the currently authenticated user's profile.
 */
export const getProfile = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/profile/');
  return data;
};

/**
 * Update the currently authenticated user's profile.
 */
export const updateProfile = async (
  profileData: Partial<User>,
): Promise<User> => {
  const { data } = await client.put<User>('/auth/profile/', profileData);
  return data;
};

/**
 * Clear tokens from localStorage and redirect to the login page.
 */
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};
