'use client'

import { useEffect } from 'react'
import { useAuth } from '@/features/auth'

/**
 * Global Auth Provider
 * Checks for token on mount and fetches user if authenticated
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated, user } = useAuth()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if we have a token
    const token = localStorage.getItem('auth_token')
    
    // Always fetch user if we have a token (even if user exists, to ensure fresh data)
    if (token && (!user || !isAuthenticated)) {
      fetchUser().catch((error) => {
        // If fetch fails, token might be invalid, clear it
        console.error('Failed to fetch user:', error)
        localStorage.removeItem('auth_token')
      })
    } else if (!token && (user || isAuthenticated)) {
      // If no token but user exists, clear user state
      // This handles logout or expired token scenarios
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return <>{children}</>
}

