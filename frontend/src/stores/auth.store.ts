// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';
import type { LoginCredentials, RegisterData } from '@/lib/validations/auth';
import userApi from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearError: () => void;
  fetchUser: () => Promise<User | null>;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<User>;
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

      fetchUserProfile: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          const user = await userApi.fetchUserProfile(userId);
          if (userId === get().user?.id) {
            set({ user, isAuthenticated: true });
          }
          return user;
        } catch (error: any) {
          set({ error: error?.message || 'Failed to fetch user profile' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchUser: async () => {
        try {
          set({ loading: true, error: null });
          const { user } = await authService.fetchUser();
          set({ user, isAuthenticated: true });
          return user;
        } catch (error: any) {
          set({ 
            user: null,
            isAuthenticated: false,
            error: error?.response?.data?.message || 'Failed to fetch user'
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (credentials) => {
        try {
          set({ loading: true, error: null });
          const { user } = await authService.login(credentials);
          set({ user, isAuthenticated: true });
          return user;
        } catch (error: any) {
          set({
            error: error?.response?.data?.message || 'Login failed',
            user: null,
            isAuthenticated: false
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      register: async (data) => {
        try {
          set({ loading: true, error: null });
          const { user } = await authService.register(data);
          set({ user, isAuthenticated: true });
          return user;
        } catch (error: any) {
          set({
            error: error?.response?.data?.message || 'Registration failed',
            user: null,
            isAuthenticated: false
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          const uid = get().user?.id;
          await authService.logout();
          set({ user: null, isAuthenticated: false });
          try {
            const { removeBookPageLocalStorageKeysForUser } = await import(
              '@/lib/book-page-local-storage'
            );
            removeBookPageLocalStorageKeysForUser(uid);
            const { useBookEditorStore } = await import(
              '@/features/books/presentation/stores/book-editor.store'
            );
            useBookEditorStore.persist.clearStorage();
            useBookEditorStore.getState().reset();
          } catch {
            // ignore if store unavailable
          }
        } catch (error: any) {
          set({
            error: error?.response?.data?.message || 'Logout failed'
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);