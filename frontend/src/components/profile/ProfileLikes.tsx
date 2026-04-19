'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { BookCard } from '@/components/book/BookCard'

interface ProfileLikesProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileLikes = ({ userId, isOwnProfile }: ProfileLikesProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-likes', userId],
    queryFn: async () => {
      const response = await api.get(`/api/likes/books`)
      return response.data
    },
    enabled: isOwnProfile,
  })

  // Hide if not own profile (until we implement public likes)
  if (!isOwnProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10">
        <h3 className="text-lg font-medium mb-2">Gizli</h3>
        <p className="text-muted-foreground text-center">
          Beğeniler sadece kullanıcının kendisi tarafından görüntülenebilir
        </p>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  const books = data?.data || []

  return (
    <div>
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium mb-2">Henüz beğendiğiniz kitap yok</h3>
          <p className="text-muted-foreground text-center">
            Kitapları beğendiğinizde burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book: any) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}

