import type { BookEntity } from '@/features/books'

type AuthUser = { id: string | number } | null | undefined

export function isBookAuthor(
  book: Pick<BookEntity, 'authorId' | 'viewerIsAuthor'>,
  user: AuthUser
): boolean {
  if (book.viewerIsAuthor) return true
  if (user == null) return false
  return Number(user.id) === Number(book.authorId)
}
