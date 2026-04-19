'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace(buildLoginUrl({ returnTo: getCurrentReturnTo() }))
    }
  }, [loading, isAuthenticated, user, router, pathname])

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="container py-16 text-center text-muted-foreground">
        Yükleniyor...
      </div>
    )
  }

  return <>{children}</>
}
