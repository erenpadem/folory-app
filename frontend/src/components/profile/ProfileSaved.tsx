// components/profile/ProfileSaved.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { BookCard } from '@/components/book/BookCard'
import { EmptyState } from '../story/EmptyState'
import { Skeleton } from '../ui/skeleton'

interface ProfileSavedProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileSaved = ({ userId, isOwnProfile }: ProfileSavedProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['library-books'],
    queryFn: async () => {
      const response = await api.get('/api/library')
      return response.data
    },
    enabled: isOwnProfile,
  })

  if (!isOwnProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10">
        <h3 className="text-lg font-medium mb-2">Gizli</h3>
        <p className="text-muted-foreground text-center">
          Kaydedilenler sadece kullanıcının kendisi tarafından görüntülenebilir
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
        ))}
      </div>
    )
  }

  const books = data?.data || []

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10">
        <h3 className="text-lg font-medium mb-2">Kitaplığınız boş</h3>
        <p className="text-muted-foreground text-center mb-6">
          Beğendiğiniz kitapları daha sonra okumak için kaydedebilirsiniz.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book: any) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}