// components/profile/ProfileTabs.tsx
'use client'

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
} from '@/components/ui/app-tabs'
import { ProfileAbout } from './ProfileAbout'
import { ProfileBooks } from './ProfileBooks'
import { ProfileComments } from './ProfileComments'
import { ProfileSaved } from './ProfileSaved'
import { ProfileFavorites } from './ProfileFavorites'
import { ProfileLikes } from './ProfileLikes'
import { ProfileQuotes } from './ProfileQuotes'
import { ProfileSettings } from './ProfileSettings'
import { User } from '@/types/auth'
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
    if (tab && ['about', 'books', 'comments', 'saved', 'favorites', 'likes', 'quotes', 'settings'].includes(tab)) {
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
    <AppTabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
      <AppTabsList className="flex max-w-full flex-nowrap gap-1 overflow-x-auto overflow-y-hidden pb-0.5 sm:grid sm:grid-cols-3 sm:overflow-visible md:grid-cols-5 lg:grid-cols-8 min-h-12 h-auto p-1">
        <AppTabsTrigger value="about" className="shrink-0">
          Hakkında
        </AppTabsTrigger>
        <AppTabsTrigger value="books" className="shrink-0">
          Kitaplar
        </AppTabsTrigger>
        <AppTabsTrigger value="comments" className="shrink-0">
          Yorumlar
        </AppTabsTrigger>
        <AppTabsTrigger value="saved" className="shrink-0">
          Kaydedilenler
        </AppTabsTrigger>
        <AppTabsTrigger value="favorites" className="shrink-0">
          Favoriler
        </AppTabsTrigger>
        <AppTabsTrigger value="likes" className="shrink-0">
          Beğeniler
        </AppTabsTrigger>
        <AppTabsTrigger value="quotes" className="shrink-0">
          Alıntılar
        </AppTabsTrigger>
        {isOwnProfile && (
          <AppTabsTrigger value="settings" className="shrink-0">
            Ayarlar
          </AppTabsTrigger>
        )}
      </AppTabsList>

      {/* Hakkında Sekmesi */}
      <AppTabsContent value="about">
        <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
      </AppTabsContent>

      {/* Kitaplar Sekmesi */}
      <AppTabsContent value="books">
        <ProfileBooks 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Yorumlar Sekmesi */}
      <AppTabsContent value="comments">
        <ProfileComments 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Kaydedilenler Sekmesi */}
      <AppTabsContent value="saved">
        <ProfileSaved 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Favoriler Sekmesi */}
      <AppTabsContent value="favorites">
        <ProfileFavorites 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Beğeniler Sekmesi */}
      <AppTabsContent value="likes">
        <ProfileLikes 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Alıntılar Sekmesi */}
      <AppTabsContent value="quotes">
        <ProfileQuotes 
          userId={user.id} 
          isOwnProfile={isOwnProfile} 
        />
      </AppTabsContent>

      {/* Ayarlar Sekmesi (sadece kendi profili) */}
      {isOwnProfile && (
        <AppTabsContent value="settings">
          <ProfileSettings user={user} />
        </AppTabsContent>
      )}
    </AppTabs>
  )
}