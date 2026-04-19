'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { BookCard } from '@/components/book/BookCard'

interface ProfileFavoritesProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileFavorites = ({ userId, isOwnProfile }: ProfileFavoritesProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-favorites', userId],
    queryFn: async () => {
      const response = await api.get(`/bookmarks`, {
        params: { user_id: userId },
      })
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  const favorites = data?.data || []

  return (
    <div>
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isOwnProfile 
              ? 'Henüz favori kitabınız yok.' 
              : 'Bu kullanıcının favori kitabı yok.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((bookmark: any) => (
            <BookCard key={bookmark.book?.id} book={bookmark.book} />
          ))}
        </div>
      )}
    </div>
  )
}

