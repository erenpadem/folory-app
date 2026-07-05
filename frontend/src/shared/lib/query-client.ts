import { QueryClient } from '@tanstack/react-query';

/** Singleton used by Providers and non-React modules (e.g. book editor save). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
