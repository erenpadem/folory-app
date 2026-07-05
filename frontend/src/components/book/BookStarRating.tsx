'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '@/features/auth'
import api from '@/shared/lib/api-client'
import { useRouter } from 'next/navigation'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface BookStarRatingProps {
  bookId: number
  averageRating: number
  ratingCount: number
  canRate?: boolean
  onRated?: () => void
}

export function BookStarRating({
  bookId,
  averageRating,
  ratingCount,
  canRate = true,
  onRated,
}: BookStarRatingProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [userScore, setUserScore] = useState<number | null>(null)
  const [hoverScore, setHoverScore] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !canRate) {
      setUserScore(null)
      return
    }
    void api
      .get(`/api/ratings/book/${bookId}/mine`)
      .then((res) => setUserScore(res.data?.data?.score ?? null))
      .catch(() => setUserScore(null))
  }, [bookId, isAuthenticated, canRate])

  const handleRate = async (score: number) => {
    if (!isAuthenticated) {
      router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
      return
    }
    if (submitting) return
    try {
      setSubmitting(true)
      await api.post('/api/ratings', { book_id: bookId, score })
      setUserScore(score)
      toast.success('Puanınız kaydedildi')
      onRated?.()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Puan kaydedilemedi'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const activeScore = hoverScore || userScore || 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Star
          className={cn(
            'h-5 w-5 shrink-0',
            averageRating > 0 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
          )}
          aria-hidden
        />
        <span className="font-medium tabular-nums">{averageRating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({ratingCount} değerlendirme)</span>
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="Kitabı puanla">
        {canRate &&
          [1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={submitting}
              className="rounded p-0.5 transition-colors hover:scale-110 disabled:opacity-50"
              aria-label={`${star} yıldız`}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(0)}
              onClick={() => void handleRate(star)}
            >
              <Star
                className={cn(
                  'h-5 w-5',
                  star <= activeScore
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        {canRate && userScore != null && (
          <span className="ml-1 text-xs text-muted-foreground">Sizin puanınız: {userScore}</span>
        )}
      </div>
    </div>
  )
}
