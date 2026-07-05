// app/providers.tsx
"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { queryClient } from '@/shared/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: '!bg-background !text-foreground !border',
              error: {
                duration: 6000,
              },
            }}
          />
          {children}
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}