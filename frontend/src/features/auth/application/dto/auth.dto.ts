/**
 * Data Transfer Objects (DTOs)
 * Used for data transfer between layers
 */
import { UserEntity } from '../../domain/entities/user.entity';

export interface LoginRequestDto {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponseDto {
  user: UserEntity;
}

export interface UserResponseDto {
  id: string | number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  role?: string;
  avatar?: string | null;
  username?: string | null;
  bio?: string | null;
  cover_image?: string | null;
  phone?: string | null;
  books_total_count?: number;
  books_published_count?: number;
  books_draft_count?: number | null;
}

