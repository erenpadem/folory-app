'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Camera, Edit, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { ProfileEditForm } from './ProfileEditForm'
import { FollowButton } from './FollowButton'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import type { User } from '@/types/auth'
import { useAuth } from '@/features/auth'
import { updateUserProfile } from '@/services/user.service'
import { compressAvatarImageToDataUrl, compressCoverImageToDataUrl } from '@/lib/profile-cover-image'
import { toast } from 'sonner'
import type { ProfileFormValues } from './ProfileEditForm'

export const ProfileHeader = ({ 
  user, 
  isOwnProfile 
}: {
  user: User
  isOwnProfile: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [coverSaving, setCoverSaving] = useState(false)
  const [avatarSaving, setAvatarSaving] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { fetchUser } = useAuth()

  const coverSrc = user.coverImage ?? user.cover_image ?? null

  const handleCoverClick = () => {
    coverInputRef.current?.click()
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası seçin')
      return
    }
    const maxMb = 10
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Görsel en fazla ${maxMb} MB olabilir`)
      return
    }

    try {
      setAvatarSaving(true)
      const dataUrl = await compressAvatarImageToDataUrl(file)
      await updateUserProfile({ avatar: dataUrl })
      await fetchUser()
      toast.success('Profil fotoğrafı güncellendi')
    } catch (err: unknown) {
      console.error(err)
      toast.error('Profil fotoğrafı yüklenemedi — dosya bozuk olabilir veya bağlantı kesildi')
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası seçin')
      return
    }
    const maxMb = 20
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Görsel en fazla ${maxMb} MB olabilir`)
      return
    }

    try {
      setCoverSaving(true)
      const dataUrl = await compressCoverImageToDataUrl(file)
      await updateUserProfile({ cover_image: dataUrl })
      await fetchUser()
      toast.success('Kapak resmi güncellendi')
    } catch (err: unknown) {
      console.error(err)
      toast.error('Kapak yüklenemedi — dosya bozuk olabilir veya bağlantı kesildi')
    } finally {
      setCoverSaving(false)
    }
  }

  const handleSaveProfile = async (values: ProfileFormValues) => {
    await updateUserProfile({
      name: values.name,
      username: values.username,
      bio: values.bio?.trim() ? values.bio : '',
    })
    await fetchUser()
    setIsEditing(false)
  }

  return (
    <>
      <div className="h-48 w-full bg-muted relative">
        {coverSrc ? (
          <img 
            src={coverSrc} 
            alt="Kapak" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleCoverChange}
          aria-hidden
        />
        {isOwnProfile && (
          <Button 
            variant="outline" 
            className="absolute top-4 right-4"
            onClick={handleCoverClick}
            disabled={coverSaving}
            type="button"
          >
            {coverSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Edit className="mr-2 h-4 w-4" />
            )}
            Kapak Resmini Değiştir
          </Button>
        )}
      </div>

      <div className="container relative">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex flex-col items-center md:items-start -mt-16">
            <div className="relative shrink-0">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className={getAvatarColor(user.name)}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleAvatarChange}
                aria-hidden
              />
              {isOwnProfile && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-1 right-1 h-9 w-9 rounded-full shadow-md"
                  onClick={handleAvatarClick}
                  disabled={avatarSaving}
                  aria-label="Profil fotoğrafını değiştir"
                  title="Profil fotoğrafını değiştir"
                >
                  {avatarSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <ProfileEditForm 
                user={user}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {(user.username || user.email) && (
                  <p className="text-muted-foreground">
                    @{user.username ?? user.email.split('@')[0]}
                  </p>
                )}
                {user.bio && (
                  <p className="mt-2">{user.bio}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  <Calendar className="inline mr-1 h-4 w-4" />
                  {new Date(user.joinDate || user.created_at || '').toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} tarihinden beri üye
                </p>
                {isOwnProfile ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Profili Düzenle
                  </Button>
                ) : (
                  <FollowButton userId={Number(user.id)} className="mt-4" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
