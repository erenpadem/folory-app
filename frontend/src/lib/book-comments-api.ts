import api from '@/shared/lib/api-client'
import { unwrapResourceCollection } from '@/shared/lib/unwrap-resource-collection'
import type { BookComment } from '@/components/book/CommentItem'

export type BookCommentsResult = {
  comments: BookComment[]
  total: number
}

export async function fetchBookComments(bookId: number): Promise<BookCommentsResult> {
  const response = await api.get(`/api/comments/book/${bookId}`)
  const body = response.data as { data?: unknown; meta?: { total?: number } }
  const comments = unwrapResourceCollection<BookComment>(body)
  const total =
    typeof body?.meta?.total === 'number' ? body.meta.total : comments.length

  return { comments, total }
}
