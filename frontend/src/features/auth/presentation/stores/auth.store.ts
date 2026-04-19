/**
 * Presentation: Auth Store
 * Zustand store for auth state management
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserEntity } from '../../domain/entities/user.entity';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { LoginRequestDto, RegisterRequestDto } from '../../application/dto/auth.dto';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';
import { AuthApi } from '../../infrastructure/api/auth.api';

// Dependency Injection
const authApi = new AuthApi();
const authRepository = new AuthRepositoryImpl(authApi);
const loginUseCase = new LoginUseCase(authRepository);
const registerUseCase = new RegisterUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);

interface AuthState {
  user: UserEntity | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: UserEntity | null) => void;
  clearError: () => void;
  fetchUser: () => Promise<UserEntity | null>;
  login: (credentials: LoginRequestDto) => Promise<UserEntity>;
  register: (data: RegisterRequestDto) => Promise<UserEntity>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearError: () => set({ error: null }),

      fetchUser: async () => {
        try {
          set({ loading: true, error: null });
          const user = await getCurrentUserUseCase.execute();
          if (user) {
            set({ user, isAuthenticated: true, error: null });
          } else {
            set({ user: null, isAuthenticated: false });
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
            }
          }
          return user;
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            error: error?.message || 'Kullanıcı bilgileri alınamadı',
          });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const user = await loginUseCase.execute(credentials);
          set({ user, isAuthenticated: true, error: null });
          return user;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
          set({
            error: errorMessage,
            user: null,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      register: async (data) => {
        try {
          set({ loading: true, error: null });
          const user = await registerUseCase.execute(data);
          set({ user, isAuthenticated: true, error: null });
          return user;
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.';
          set({
            error: errorMessage,
            user: null,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          await logoutUseCase.execute();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ user: null, isAuthenticated: false, error: null });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 
                              error?.message || 
                              'Çıkış yapılırken bir hata oluştu.';
          set({
            error: errorMessage,
          });
          // Clear local state even if API call fails
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ user: null, isAuthenticated: false });
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't persist user - always fetch from API to ensure fresh data
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

