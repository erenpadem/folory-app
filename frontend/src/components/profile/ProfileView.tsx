'use client'

import { ProfileHeader } from './ProfileHeader'

import type { User } from '@/types/user'

interface ProfileViewProps {
  user: User
  isOwnProfile: boolean
}

export const ProfileView = ({ user, isOwnProfile }: ProfileViewProps) => {
  return (
    <div className="pb-12">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      
      <div className="container mt-4">
        <ProfileTabs user={user} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  )
}