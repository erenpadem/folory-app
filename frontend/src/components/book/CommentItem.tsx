'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Heart, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import { commentAuthorAvatar, commentAuthorLabel } from '@/lib/comment-user-display'
import { CommentContent } from '../comment/CommentContent'
import { MentionTextarea } from '../comment/MentionTextarea'
import api from '@/shared/lib/api-client'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import toast from 'react-hot-toast'
import { toggleCommentLike } from '@/lib/comment-like-api'

export interface BookComment {
  id: number
  content?: string
  text?: string
  user?: { id?: number; name?: string | null; username?: string | null; avatar?: string | null }
  user_id?: number
  book_id?: number
  book?: { id?: number; slug?: string }
  tag_links?: Record<string, string>
  likes_count?: number
  likes?: number
  is_liked?: boolean
  created_at?: string
  date?: string
  replies?: BookComment[]
}

interface CommentItemProps {
  comment: BookComment
  bookId: number
  depth: number
  onReplyPosted?: () => void
  onLikeUpdated?: () => void
}

function displayName(comment: BookComment): string {
  return commentAuthorLabel(comment.user)
}

function avatarSrc(comment: BookComment): string | undefined {
  return commentAuthorAvatar(comment.user)
}

function displayDate(comment: BookComment): string {
  if (comment.created_at) {
    return new Date(comment.created_at).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return comment.date ?? 'Şimdi'
}

export function CommentItem({
  comment,
  bookId,
  depth,
  onReplyPosted,
  onLikeUpdated,
}: CommentItemProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likes_count ?? comment.likes ?? 0)
  const [isLiked, setIsLiked] = useState(Boolean(comment.is_liked))
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    setLikesCount(comment.likes_count ?? comment.likes ?? 0)
    setIsLiked(Boolean(comment.is_liked))
  }, [comment.likes_count, comment.likes, comment.is_liked])

  const commentId = Number(comment.id)
  const replies = comment.replies ?? []

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    if (!isAuthenticated) {
      router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/comments', {
        book_id: bookId,
        content: replyContent.trim(),
        parent_id: commentId,
      })
      toast.success('Yanıtınız gönderildi')
      setReplyingTo(null)
      setReplyContent('')
      onReplyPosted?.()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Yanıt gönderilemedi'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
      return
    }
    if (!Number.isFinite(commentId) || commentId <= 0) {
      toast.error('Geçersiz yorum')
      return
    }
    if (liking) return

    const prevLiked = isLiked
    const prevCount = likesCount
    const nextLiked = !prevLiked
    setLiking(true)
    setIsLiked(nextLiked)
    setLikesCount(Math.max(0, prevCount + (nextLiked ? 1 : -1)))

    try {
      const result = await toggleCommentLike(commentId)
      setIsLiked(result.liked)
      setLikesCount(result.likes_count)
      onLikeUpdated?.()
    } catch (error: unknown) {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Beğeni işlemi başarısız'
      toast.error(message)
    } finally {
      setLiking(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative ${depth > 0 ? 'pl-6' : ''}`}
        style={{ marginLeft: depth > 0 ? '1.5rem' : '0' }}
      >
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border transform -translate-x-1/2" />
        )}

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatarSrc(comment)} />
            <AvatarFallback className={getAvatarColor(displayName(comment))}>
              {getInitials(displayName(comment))}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{displayName(comment)}</p>
            <p className="text-sm text-muted-foreground">{displayDate(comment)}</p>
          </div>
        </div>

        <div className={`pl-12 ${depth > 0 ? 'pl-6' : ''}`}>
          {comment.content ? (
            <CommentContent
              content={comment.content}
              bookSlug={comment.book?.slug}
              tagLinks={comment.tag_links}
            />
          ) : (
            <p>{comment.text}</p>
          )}
        </div>

        <div className="pl-12 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? 'text-primary' : ''}`}
            disabled={liking}
            onClick={() => void handleToggleLike()}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setReplyingTo(replyingTo === commentId ? null : commentId)}
          >
            <MessageSquare className="h-4 w-4" />
            Yanıtla
          </Button>
          {replies.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Cevapları gizle
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {replies.length} cevap
                </>
              )}
            </Button>
          ) : null}
        </div>

        {replyingTo === commentId && (
          <form onSubmit={(e) => void handleReplySubmit(e)} className="pl-12 mt-2 space-y-2">
            <MentionTextarea
              value={replyContent}
              onChange={setReplyContent}
              placeholder="Yanıtınızı yazın... @ ile etiketleyebilirsiniz"
              bookId={bookId}
              className="bg-background"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                İptal
              </Button>
              <Button type="submit" size="sm" disabled={!replyContent.trim() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Gönder'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && isExpanded && (
        <div className="pl-6">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              bookId={bookId}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
              onLikeUpdated={onLikeUpdated}
            />
          ))}
        </div>
      )}

      <Separator className={`${depth > 0 ? 'ml-6' : ''}`} />
    </div>
  )
}
