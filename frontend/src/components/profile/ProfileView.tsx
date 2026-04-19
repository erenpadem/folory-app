'use client'

import { ProfileHeader } from './ProfileHeader'

import type { User } from '@/types/auth'
import { ProfileTabs } from './ProfileTabs'

interface ProfileViewProps {
  user: User
  isOwnProfile: boolean
}

/** API (snake_case) ile istemci alanlarını tek tipe indirger */
function normalizeProfileUser(user: User): User {
  const cover =
    user.coverImage ?? user.cover_image ?? null
  const join =
    user.joinDate ?? user.created_at ?? undefined
  return {
    ...user,
    coverImage: cover,
    joinDate: join,
  }
}

export const ProfileView = ({ user, isOwnProfile }: ProfileViewProps) => {
  const normalized = normalizeProfileUser(user)
  return (
    <div className="pb-12">
      <ProfileHeader user={normalized} isOwnProfile={isOwnProfile} />
      
      <div className="container mt-4">
        <ProfileTabs user={normalized} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  )
}