// components/book/BookCommentsTab.tsx
'use client'

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommentItem } from "./CommentItem"
import { MentionTextarea } from "../comment/MentionTextarea"
import { BookEntity } from "@/features/books"
import { useAuth } from "@/features/auth"
import api from "@/shared/lib/api-client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import Link from "next/link"
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import { SurfacePanel } from '@/components/ui/surface-panel'

interface BookCommentsTabProps {
  book: BookEntity
}

export function BookCommentsTab({ book }: BookCommentsTabProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  // Fetch comments
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['book-comments', book.id],
    queryFn: async () => {
      const response = await api.get(`/api/comments/book/${book.id}`)
      return response.data
    },
  })

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post('/api/comments', {
        book_id: book.id,
        content,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Yorum başarıyla eklendi')
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['book-comments', book.id] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Yorum eklenirken bir hata oluştu')
    },
  })

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    addCommentMutation.mutate(comment)
  }

  const comments = commentsData?.data || []

  return (
    <SurfacePanel>
      <h3 className="text-lg font-semibold tracking-tight md:text-xl">
        Yorumlar ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <MentionTextarea
                value={comment}
                onChange={setComment}
                placeholder="Yorumunuzu yazın... @ ile kitap, yazar, bölüm veya sayfa etiketleyebilirsiniz"
                bookId={book.id}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!comment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
          </div>
        </form>
      )}

      {!user && (
        <p className="mt-4 rounded-lg border border-dashed border-border/50 bg-background/40 px-4 py-6 text-center text-muted-foreground dark:bg-background/20">
          <Link
            href={buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' })}
            className="font-medium text-primary underline"
          >
            Hesap oluşturun veya giriş yapın
          </Link>
          {' '}— yorum yazmak için hesap gerekir.
        </p>
      )}

      <Separator className="my-6 bg-border/50" />

      <div className="space-y-6">
        {isLoading ? (
          <p className="py-6 text-center text-muted-foreground">Yükleniyor...</p>
        ) : comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/45 bg-background/35 py-8 text-center text-muted-foreground dark:bg-background/15">
            Henüz yorum yapılmamış. İlk yorumu siz yapın!
          </p>
        ) : (
          comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              bookId={book.id}
            />
          ))
        )}
      </div>
    </SurfacePanel>
  )
}

