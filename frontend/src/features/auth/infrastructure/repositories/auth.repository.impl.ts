/**
 * Infrastructure: Auth Repository Implementation
 * Concrete implementation of auth repository using API
 */
import { AuthRepository, RegisterData } from '../../domain/repositories/auth.repository.interface';
import { LoginCredentials } from '../../domain/value-objects/credentials.vo';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthApi } from '../api/auth.api';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authApi: AuthApi) {}

  async login(credentials: LoginCredentials): Promise<UserEntity> {
    const response = await this.authApi.login({
      email: credentials.email.value,
      password: credentials.password,
      remember: credentials.remember,
    });

    // Token is already saved by API interceptor
    return UserEntity.fromPrimitives(response.data);
  }

  async register(data: RegisterData): Promise<UserEntity> {
    const response = await this.authApi.register(data);
    // Token is already saved by API interceptor
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

