/**
 * Repository Interface (Port)
 * Defines the contract for auth persistence operations
 */
import { UserEntity } from '../entities/user.entity';
import { LoginCredentials } from '../value-objects/credentials.vo';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<UserEntity>;
  register(data: RegisterData): Promise<UserEntity>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserEntity | null>;
  refreshUser(): Promise<UserEntity>;
}

