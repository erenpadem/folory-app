import { resolveMediaUrl } from '@/lib/media-url'

export type CommentUserLike = {
  id?: number
  name?: string | null
  username?: string | null
  avatar?: string | null
}

export function commentAuthorLabel(user?: CommentUserLike | null): string {
  const name = user?.name?.trim()
  if (name) return name
  const username = user?.username?.trim()
  if (username) return username
  return 'Kullanıcı'
}

export function commentAuthorAvatar(user?: CommentUserLike | null): string | undefined {
  return resolveMediaUrl(user?.avatar ?? undefined)
}
