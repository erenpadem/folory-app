// components/profile/ProfileTabs.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileAbout } from './ProfileAbout'
import { ProfileStories } from './ProfileStories'
import { ProfileComments } from './ProfileComments'
import { ProfileSaved } from './ProfileSaved'
import { ProfileSettings } from './ProfileSettings'
import { User } from '@/types/user'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProfileTabsProps {
  user: User
  isOwnProfile: boolean
}

export const ProfileTabs = ({ user, isOwnProfile }: ProfileTabsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('about')

  // URL'den tab durumunu oku
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['about', 'stories', 'comments', 'saved', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Tab değişikliğinde URL'yi güncelle
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    setActiveTab(value)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <TabsList className="w-full grid grid-cols-4 md:grid-cols-5 h-12">
        <TabsTrigger value="about" className="py-2">
          Hakkında
        </TabsTrigger>
        <TabsTrigger value="stories" className="py-2">
          Hikayeler
        </TabsTrigger>
        <TabsTrigger value="comments" className="py-2">
          Yorumlar
        </TabsTrigger>
        <TabsTrigger value="saved" className="py-2">
          Kaydedilenler
        </TabsTrigger>
        {isOwnProfile && (
          <TabsTrigger value="settings" className="py-2">
            Ayarlar
          </TabsTrigger>
        )}
      </TabsList>

      {/* Hakkında Sekmesi */}
      <TabsContent value="about" className="mt-6">
        <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
      </TabsContent>

      {/* Hikayeler Sekmesi */}
      <TabsContent value="stories" className="mt-6">
        <ProfileStories 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </TabsContent>

      {/* Yorumlar Sekmesi */}
      <TabsContent value="comments" className="mt-6">
        <ProfileComments 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </TabsContent>

      {/* Kaydedilenler Sekmesi */}
      <TabsContent value="saved" className="mt-6">
        <ProfileSaved 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </TabsContent>

      {/* Ayarlar Sekmesi (sadece kendi profili) */}
      {isOwnProfile && (
        <TabsContent value="settings" className="mt-6">
          <ProfileSettings user={user} />
        </TabsContent>
      )}
    </Tabs>
  )
}