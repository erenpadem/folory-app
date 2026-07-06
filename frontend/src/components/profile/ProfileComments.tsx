// components/profile/ProfileComments.tsx
'use client'

import { Skeleton } from '../ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import api from '@/shared/lib/api-client'
import Link from 'next/link'
import { CommentContent } from '../comment/CommentContent'
import { Card, CardContent } from '@/components/ui/card'
import { unwrapResourceCollection } from '@/shared/lib/unwrap-resource-collection'

interface ProfileCommentsProps {
  userId: string | number
  isOwnProfile: boolean
}

interface Comment {
  id: number
  content: string
  book_id: number
  book?: {
    id: number
    title: string
    slug: string
  }
  user?: {
    id: number
    name: string
    avatar?: string
  }
  created_at: string
}

export const ProfileComments = ({ userId, isOwnProfile }: ProfileCommentsProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-comments', userId],
    queryFn: async () => {
      const response = await api.get(`/api/users/${userId}/comments`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  const comments: Comment[] = unwrapResourceCollection<Comment>(data)

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {isOwnProfile
            ? 'Henüz bir kitaba yorum yapmadınız'
            : 'Bu kullanıcı henüz yorum yapmadı'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              {comment.book ? (
                <Link
                  href={`/book/${comment.book.slug || comment.book.id}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {comment.book.title}
                </Link>
              ) : (
                <span className="text-sm text-muted-foreground">Kitap</span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </div>
            <CommentContent
              content={comment.content}
              bookId={comment.book_id}
              bookSlug={comment.book?.slug}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}