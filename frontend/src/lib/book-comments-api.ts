import api from '@/shared/lib/api-client'

export async function fetchBookComments(bookId: number) {
  const response = await api.get(`/api/comments/book/${bookId}`)
  return response.data
}
