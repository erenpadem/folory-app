import api from '@/shared/lib/api-client'
import type { QueryClient } from '@tanstack/react-query'

const STORAGE_PREFIX = 'folory_book_view'

/**
 * Count one read per browser session per book (server increments read_count).
 */
export async function recordBookViewOnce(
  bookId: number,
  slug: string,
  queryClient?: QueryClient,
  bookQueryKey?: unknown[]
): Promise<void> {
  if (typeof window === 'undefined') return
  const key = `${STORAGE_PREFIX}_${bookId}`
  if (sessionStorage.getItem(key)) return
  try {
    await api.post(`/api/books/${encodeURIComponent(slug)}/view`)
    sessionStorage.setItem(key, '1')
    if (queryClient && bookQueryKey) {
      await queryClient.invalidateQueries({ queryKey: bookQueryKey })
    }
  } catch {
    // ignore — view tracking must not block reading
  }
}
