'use client'

import { useAuth } from '@/features/auth'
import { ProfileView } from '@/components/profile/ProfileView'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/auth'

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !isAuthenticated && !user) {
      router.push('/auth/login?returnTo=/profile')
    }
  }, [isAuthenticated, user, router, loading])

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userData: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? null,
    coverImage: user.coverImage ?? null,
    username: user.username ?? user.email.split('@')[0] ?? null,
    bio: user.bio ?? null,
    phone: user.phone ?? null,
    joinDate: user.createdAt.toISOString(),
    created_at: user.createdAt.toISOString(),
    role: user.role,
    books_total_count: user.booksTotalCount,
    books_published_count: user.booksPublishedCount,
    books_draft_count: user.booksDraftCount ?? null,
  }

  return <ProfileView user={userData} isOwnProfile={true} />
}