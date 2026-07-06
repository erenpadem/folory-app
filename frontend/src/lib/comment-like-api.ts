import api from '@/shared/lib/api-client'

export type CommentLikeResult = {
  liked: boolean
  likes_count: number
}

export async function toggleCommentLike(commentId: number): Promise<CommentLikeResult> {
  const response = await api.post(`/api/comments/${commentId}/like`)
  const body = response.data as {
    data?: { liked?: boolean; likes_count?: number }
    liked?: boolean
    likes_count?: number
  }
  const payload = body.data ?? body

  return {
    liked: Boolean(payload.liked),
    likes_count:
      typeof payload.likes_count === 'number' ? payload.likes_count : 0,
  }
}
