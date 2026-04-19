/**
 * Shared: API Client
 * Axios instance with interceptors
 */
import axios, { type AxiosInstance } from 'axios';
import toast from 'react-hot-toast';

export function normalizeApiUrl(url?: string) {
  if (!url) return url;
  // Do not touch absolute URLs
  if (/^https?:\/\//i.test(url)) return url;
  // Ensure we always call backend api with /api prefix
  if (!url.startsWith('/api/')) {
    // allow leading slash or not
    return url.startsWith('/') ? `/api${url}` : `/api/${url}`;
  }
  return url;
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  });

  // Request interceptor - URL normalize + Add token
  instance.interceptors.request.use(
    (config) => {
      // Normalize URL to /api/*
      config.url = normalizeApiUrl(config.url);

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors and token management
  instance.interceptors.response.use(
    (response) => {
      // Save token if present in response
      if (response.data?.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.data.token);
      }
      return response;
    },
    (error) => {
      const { response, request, message, config } = error;

      if (response) {
        const status = response.status;
        const messageFromServer = response.data?.message;

        // Clear token on 401
        if (status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }

        const rawUrl = config?.url ?? '';
        let pathOnly = rawUrl.split('?')[0];
        if (pathOnly.startsWith('http')) {
          try {
            pathOnly = new URL(pathOnly).pathname;
          } catch {
            /* keep pathOnly */
          }
        }
        const method = (config?.method ?? 'get').toLowerCase();
        // Single-book GET (show): page shows inline error; avoid duplicate toast with 404 message
        const isBookShowGet404 =
          status === 404 &&
          method === 'get' &&
          /^\/api\/books\/(?!me$)[^/]+$/.test(pathOnly);
        // Do not redirect guests to login for optional auth checks or background polls
        const isSilentEndpoint =
          pathOnly.includes('/notifications/unread-count') ||
          pathOnly.endsWith('/api/user') ||
          (pathOnly.includes('/library/') && pathOnly.includes('/check')) ||
          (pathOnly.includes('/library/') &&
            (pathOnly.includes('/reading') || pathOnly.includes('/progress'))) ||
          (pathOnly.includes('/bookmarks/page/') && pathOnly.includes('/check')) ||
          (pathOnly.includes('/likes/books/') && pathOnly.includes('/check'));

        switch (status) {
          case 400:
            toast.error(messageFromServer || 'Hatalı istek');
            break;
          case 401:
            if (!isSilentEndpoint) {
              toast.error(messageFromServer || 'Yetkisiz erişim – lütfen giriş yapın');
              if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/auth/login') &&
                !window.location.pathname.startsWith('/auth/callback')
              ) {
                const returnTo = encodeURIComponent(
                  window.location.pathname + window.location.search
                );
                window.location.href = `/auth/login?returnTo=${returnTo}`;
              }
            }
            break;
          case 403:
            toast.error(messageFromServer || 'Erişim engellendi');
            break;
          case 404:
            // Don't show toast for 404 on certain endpoints (or when UI shows its own message)
            if (!isSilentEndpoint && !isBookShowGet404) {
              toast.error(messageFromServer || 'İstek yapılan veri bulunamadı');
            }
            break;
          case 422: {
            const rawErrors = response.data?.errors;
            if (rawErrors && typeof rawErrors === 'object') {
              const errors = rawErrors as Record<string, string[]>;
              const firstError = Object.values(errors)[0]?.[0];
              toast.error(firstError || 'Doğrulama hatası');
            } else {
              toast.error(messageFromServer || 'Doğrulama hatası');
            }
            break;
          }
          case 500:
            toast.error(messageFromServer || 'Sunucu hatası – daha sonra tekrar deneyin');
            break;
          default:
            toast.error(messageFromServer || 'Bilinmeyen bir hata oluştu');
        }
      } else if (request) {
        // Network error or timeout
        if (error.code === 'ECONNABORTED') {
          toast.error('İstek zaman aşımına uğradı – lütfen tekrar deneyin');
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Sunucuya ulaşılamıyor – internet bağlantınızı kontrol edin');
        } else {
          toast.error('Sunucuya ulaşılamıyor – internet bağlantınızı kontrol edin');
        }
      } else {
        toast.error(`İstek hatası: ${message}`);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

// One client + one interceptor chain per browser tab: avoids duplicate toasts when
// Next.js Fast Refresh re-evaluates this module and would otherwise stack interceptors.
let serverSingleton: AxiosInstance | undefined;

const api: AxiosInstance = (() => {
  if (typeof window !== 'undefined') {
    const w = window as Window & { __foloryAxios?: AxiosInstance };
    if (!w.__foloryAxios) {
      w.__foloryAxios = createApiClient();
    }
    return w.__foloryAxios;
  }
  if (!serverSingleton) {
    serverSingleton = createApiClient();
  }
  return serverSingleton;
})();

export default api;
