export interface User {
    id: number | string;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
    role?: string;
    avatar?: string | null;
    username?: string | null;
    bio?: string | null;
    /** API alanı (public profil vb.) */
    cover_image?: string | null;
    /** Birleşik gösterim için tercih edilen alan */
    coverImage?: string | null;
    /** Hesap ayarlarında kayıtlı telefon (E.164 veya serbest biçim) */
    phone?: string | null;
    joinDate?: string;
    storyCount?: number;
    books_total_count?: number;
    books_published_count?: number;
    books_draft_count?: number | null;
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