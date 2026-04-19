'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { Card } from '@/components/ui/card'

interface ProfileQuotesProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileQuotes = ({ userId, isOwnProfile }: ProfileQuotesProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-quotes', userId],
    queryFn: async () => {
      const response = await api.get(`/quotes`, {
        params: { user_id: userId },
      })
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  const quotes = data?.data || []

  return (
    <div>
      {quotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isOwnProfile 
              ? 'Henüz alıntı kaydetmediniz.' 
              : 'Bu kullanıcının alıntısı yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote: any) => (
            <Card key={quote.id} className="p-6">
              <blockquote className="text-lg italic mb-4">
                "{quote.content}"
              </blockquote>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{quote.book?.title}</span>
                <span>{new Date(quote.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

