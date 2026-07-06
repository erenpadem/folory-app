/**
 * Infrastructure: Auth Repository Implementation
 * Concrete implementation of auth repository using API
 */
import { AuthRepository, RegisterData } from '../../domain/repositories/auth.repository.interface';
import { LoginCredentials } from '../../domain/value-objects/credentials.vo';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthApi } from '../api/auth.api';
import { setAuthToken } from '@/shared/lib/auth-token';

function persistAuthToken(token?: string, remember = true) {
  if (!token) return;
  setAuthToken(token, remember);
}

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authApi: AuthApi) {}

  async login(credentials: LoginCredentials): Promise<UserEntity> {
    const response = await this.authApi.login({
      email: credentials.email.value,
      password: credentials.password,
      remember: credentials.remember,
    });

    persistAuthToken(response.token, credentials.remember);
    return UserEntity.fromPrimitives(response.data);
  }

  async register(data: RegisterData): Promise<UserEntity> {
    const response = await this.authApi.register(data);
    persistAuthToken(response.token, true);
    return UserEntity.fromPrimitives(response.data);
  }

  async logout(): Promise<void> {
    await this.authApi.logout();
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    try {
      const response = await this.authApi.getCurrentUser();
      return UserEntity.fromPrimitives(response.data);
    } catch (error) {
      return null;
    }
  }

  async refreshUser(): Promise<UserEntity> {
    const response = await this.authApi.getCurrentUser();
    return UserEntity.fromPrimitives(response.data);
  }
}

