import api from '@/lib/api';
import type { LoginCredentials, RegisterData, User } from '@/types/auth';

export const authService = {
  async login(data: LoginCredentials): Promise<{ user: User }> {
    const response = await api.post('/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User }> {
    const response = await api.post('/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async fetchUser(): Promise<{ user: User }> {
    const response = await api.get('/user');
    return response.data;
  }
};