'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { BookCard } from '@/components/book/BookCard'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProfileBooksProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileBooks = ({ userId, isOwnProfile }: ProfileBooksProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-books', userId],
    queryFn: async () => {
      const response = await api.get(`/books`, {
        params: { author_id: userId },
      })
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  const books = data?.data || []

  return (
    <div>
      {isOwnProfile && (
        <div className="mb-6 flex justify-end">
          <Link href="/dashboard/books/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kitap Oluştur
            </Button>
          </Link>
        </div>
      )}

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isOwnProfile 
              ? 'Henüz kitap oluşturmadınız.' 
              : 'Bu kullanıcı henüz kitap oluşturmamış.'}
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

