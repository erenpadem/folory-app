/**
 * Infrastructure: Auth API Client
 * HTTP client for authentication endpoints
 */
import api from '@/shared/lib/api-client';
import { clearAuthToken } from '@/shared/lib/auth-token';
import { UserResponseDto } from '../../application/dto/auth.dto';

interface AuthResponse {
  success: boolean;
  data: {
    user: UserResponseDto;
    token: string;
  };
  message?: string;
}

interface UserResponse {
  success: boolean;
  data: {
    user: UserResponseDto;
  };
}

export class AuthApi {
  async login(data: { email: string; password: string; remember?: boolean }) {
    const response = await api.post<AuthResponse>('/api/login', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Giriş başarısız');
    }
    return {
      data: response.data.data.user,
      token: response.data.data.token,
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    const response = await api.post<AuthResponse>('/api/register', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Kayıt başarısız');
    }
    return {
      data: response.data.data.user,
      token: response.data.data.token,
    };
  }

  async logout() {
    const response = await api.post<{ success: boolean; message?: string }>('/api/logout');
    if (typeof window !== 'undefined') {
      clearAuthToken();
    }
    return response.data;
  }

  async getCurrentUser(): Promise<{ data: UserResponseDto }> {
    const response = await api.get<UserResponse>('/api/user');
    if (!response.data.success) {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }
    return {
      data: response.data.data.user,
    };
  }

  async resendVerificationEmail() {
    await api.post('/api/email/verification-notification');
  }

  async verifyEmailWithCode(code: string) {
    await api.post('/api/email/verify-code', { code });
  }

  async becomeAuthor() {
    const response = await api.post<{ success: boolean; message?: string; data?: { role: string } }>(
      '/api/user/become-author'
    );
    return response.data;
  }
}

