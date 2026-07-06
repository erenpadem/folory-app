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
import {
  extractApiFieldErrors,
  extractApiValidationMessage,
} from '@/shared/lib/api-validation';
import { clearAuthToken, getAuthToken } from '@/shared/lib/auth-token';

function isDuplicateEmailError(error: unknown): boolean {
  const message = extractApiValidationMessage(error) ?? '';
  const fieldError = extractApiFieldErrors(error)?.email ?? '';
  return (
    message.includes('zaten kullanılıyor') ||
    fieldError.includes('zaten kullanılıyor')
  );
}

let registerInFlight: Promise<UserEntity> | null = null;
let loginInFlight: Promise<UserEntity> | null = null;

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
              clearAuthToken();
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
            clearAuthToken();
          }
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (credentials) => {
        if (loginInFlight) return loginInFlight;

        loginInFlight = (async () => {
          try {
            set({ loading: true, error: null });
            const user = await loginUseCase.execute(credentials);
            set({ user, isAuthenticated: true, error: null });
            return user;
          } catch (error: unknown) {
            const errorMessage =
              extractApiValidationMessage(error) ||
              (error as { message?: string })?.message ||
              'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
            set({
              error: errorMessage,
              user: null,
              isAuthenticated: false,
            });
            throw new Error(errorMessage);
          } finally {
            set({ loading: false });
            loginInFlight = null;
          }
        })();

        return loginInFlight;
      },

      register: async (data) => {
        if (registerInFlight) return registerInFlight;

        registerInFlight = (async () => {
          try {
            set({ loading: true, error: null });
            const user = await registerUseCase.execute(data);
            set({ user, isAuthenticated: true, error: null });
            return user;
          } catch (error: unknown) {
            const errorMessage =
              extractApiValidationMessage(error) ||
              (error as { message?: string })?.message ||
              'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.';

            if (isDuplicateEmailError(error)) {
              const token =
                typeof window !== 'undefined' ? getAuthToken() : null;
              const existingUser = get().user;
              if (token && existingUser) {
                set({ user: existingUser, isAuthenticated: true, error: null });
                return existingUser;
              }
              try {
                const user = await loginUseCase.execute({
                  email: data.email,
                  password: data.password,
                });
                set({ user, isAuthenticated: true, error: null });
                return user;
              } catch {
                /* fall through to register error */
              }
            }

            set({
              error: errorMessage,
              user: null,
              isAuthenticated: false,
            });
            throw new Error(errorMessage);
          } finally {
            set({ loading: false });
            registerInFlight = null;
          }
        })();

        return registerInFlight;
      },

      logout: async () => {
        try {
          set({ loading: true });
          await logoutUseCase.execute();
          if (typeof window !== 'undefined') {
            clearAuthToken();
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
            clearAuthToken();
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

