'use client'

import { useAuth } from '@/hooks/useAuth'
import { ProfileView } from '@/components/profile/ProfileView'
import { redirect } from 'next/navigation'

export default function PrivateProfile() {
  const { user } = useAuth()
  
  if (!user) {
    redirect('/login?returnTo=/profile')
  }

  return <ProfileView user={user} isOwnProfile={true} />
}