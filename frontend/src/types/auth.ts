export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    remember?: boolean;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }
  
  export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    clearError: () => void;
    fetchUser: () => Promise<User | undefined>;
    login: (credentials: LoginCredentials) => Promise<User | undefined>;
    register: (data: RegisterData) => Promise<User | undefined>;
    logout: () => Promise<void>;
  }