// src/services/auth.service.ts
import api from '@/lib/api';
import type { 
  LoginCredentials, 
  RegisterData, 
  User,
  // ForgotPasswordData,
  // ResetPasswordData,
  // VerifyEmailData
} from '@/types/auth';

export const authService = {
  async login(data: LoginCredentials): Promise<{ user: User }> {
    console.log('data :>> ', data);
    await api.get('/sanctum/csrf-cookie');
    
    const response = await api.post('/api/login', data);
    console.log('response,data :>> ', response,data);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ user: User }> {
    // Get CSRF protection cookie
    await api.get('/sanctum/csrf-cookie');
    
    // Register request with API prefix
    const response = await api.post('/api/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/logout');
  },

  async fetchUser(): Promise<{ user: User }> {
    // Protected endpoint with API prefix
    const response = await api.get('/api/user');
    return response.data;
  },

  // async forgotPassword(data: ForgotPasswordData): Promise<void> {
  //   await api.post('/api/forgot-password', { email: data.email });
  // },

  // async resetPassword(data: ResetPasswordData): Promise<void> {
  //   await api.post('/api/reset-password', data);
  // },

  // async verifyEmail(data: VerifyEmailData): Promise<void> {
  //   await api.post('/api/email/verify', data);
  // },

  async resendVerificationEmail(): Promise<void> {
    await api.post('/api/email/verification-notification');
  }
};