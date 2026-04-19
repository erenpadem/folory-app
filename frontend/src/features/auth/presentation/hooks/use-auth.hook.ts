/**
 * Presentation: Auth Hook
 * React hook for authentication state and operations
 */
import { useAuthStore } from '../stores/auth.store';
import { useShallow } from 'zustand/react/shallow';

export const useAuth = () => {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      loading: state.loading,
      error: state.error,
      isAuthenticated: state.isAuthenticated,
      login: state.login,
      register: state.register,
      logout: state.logout,
      fetchUser: state.fetchUser,
      clearError: state.clearError,
      setUser: state.setUser,
    }))
  );
};

