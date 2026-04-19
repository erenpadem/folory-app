import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './use-auth.hook';
import { UserEntity } from '../../domain/entities/user.entity';

const mockUser = UserEntity.fromPrimitives({
  id: 1,
  name: 'Test',
  email: 'test@example.com',
  role: 'author',
});

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      user: mockUser,
      loading: false,
      error: null,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchUser: vi.fn(),
      clearError: vi.fn(),
      setUser: vi.fn(),
    }),
}));

describe('useAuth', () => {
  it('exposes user, flags and auth actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.role).toBe('author');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});
