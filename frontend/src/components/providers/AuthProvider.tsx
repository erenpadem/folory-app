'use client'

import { useEffect } from 'react'
import { useAuth } from '@/features/auth'
import { getAuthToken, clearAuthToken } from '@/shared/lib/auth-token'

/**
 * Global Auth Provider
 * Checks for token on mount and fetches user if authenticated
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated, user, loading } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined' || loading) return

    const token = getAuthToken()

    if (token && !user) {
      fetchUser().catch((error) => {
        console.error('Failed to fetch user:', error)
        clearAuthToken()
      })
    }
  }, [fetchUser, user, isAuthenticated, loading])

  return <>{children}</>
}

