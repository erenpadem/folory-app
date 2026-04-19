import { beforeEach, describe, expect, it, vi } from 'vitest';

const loginMock = vi.fn();
const registerMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: (...args: unknown[]) => loginMock(...args),
    register: (...args: unknown[]) => registerMock(...args),
    logout: (...args: unknown[]) => logoutMock(...args),
    fetchUser: vi.fn(),
    resendVerificationEmail: vi.fn(),
  },
}));

import { useAuthStore } from '@/stores/auth.store';

describe('auth.store', () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
    logoutMock.mockReset();
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
  });

  it('stores author role after login', async () => {
    loginMock.mockResolvedValue({
      user: {
        id: 1,
        name: 'Author',
        email: 'author@example.com',
        role: 'author',
      },
    });

    await useAuthStore.getState().login({
      email: 'author@example.com',
      password: 'secret12',
    });

    expect(useAuthStore.getState().user?.role).toBe('author');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('stores reader role after login', async () => {
    loginMock.mockResolvedValue({
      user: {
        id: 2,
        name: 'Reader',
        email: 'reader@example.com',
        role: 'reader',
      },
    });

    await useAuthStore.getState().login({
      email: 'reader@example.com',
      password: 'secret12',
    });

    expect(useAuthStore.getState().user?.role).toBe('reader');
  });

  it('clears user on logout', async () => {
    useAuthStore.setState({
      user: { id: 1, name: 'X', email: 'x@x.com' },
      isAuthenticated: true,
    });
    logoutMock.mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    expect(logoutMock).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
