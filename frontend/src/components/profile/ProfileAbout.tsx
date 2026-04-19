// components/profile/ProfileAbout.tsx
'use client'

import { Button } from '@/components/ui/button'
import { User } from '@/types/auth'
import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { updateUserProfile } from '@/services/user.service'
import { useAuth } from '@/features/auth'

interface ProfileAboutProps {
  user: User
  isOwnProfile: boolean
}

export const ProfileAbout = ({ user, isOwnProfile }: ProfileAboutProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(user.bio || '')
  const { fetchUser } = useAuth()

  useEffect(() => {
    setBio(user.bio || '')
  }, [user.bio])

  const handleSave = () => {
    const savePromise = (async () => {
      await updateUserProfile({ bio })
      await fetchUser()
      setIsEditing(false)
    })()

    toast.promise(
      savePromise,
      {
        loading: 'Bio güncelleniyor...',
        success: 'Bio başarıyla güncellendi!',
        error: 'Bio güncellenirken bir hata oluştu'
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hakkında</h2>
        {isOwnProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-muted-foreground"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isEditing ? 'İptal' : 'Düzenle'}
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border rounded-md min-h-[100px]"
            placeholder="Kendiniz hakkında bir şeyler yazın..."
          />
          <Button onClick={handleSave}>Kaydet</Button>
        </div>
      ) : (
        <p className="text-muted-foreground">
          {bio || 'Kullanıcı henüz bir bio eklemedi.'}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Katılım Tarihi</h3>
          <p>
            {new Date(user.joinDate || user.created_at || '').toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Kitap</h3>
          <p className="text-lg font-medium tabular-nums">
            {user.books_total_count ?? user.storyCount ?? 0}
          </p>
          {isOwnProfile &&
            typeof user.books_published_count === 'number' &&
            typeof user.books_draft_count === 'number' && (
              <p className="text-sm text-muted-foreground mt-1">
                Yayında: {user.books_published_count} · Taslak: {user.books_draft_count}
              </p>
            )}
        </div>
      </div>
    </div>
  )
}