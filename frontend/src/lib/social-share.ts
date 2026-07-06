import { BRAND_NAME } from '@/lib/brand'

export type SharePayload = {
  url: string
  title: string
  description: string
  imageUrl?: string | null
}

export function buildBookSharePayload(
  book: {
    title: string
    slug?: string
    id: number
    shortDescription?: string | null
    cover?: string | null
  },
  origin?: string
): SharePayload {
  const bookSlug = book.slug || String(book.id)
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const url = `${base.replace(/\/$/, '')}/book/${bookSlug}`
  const description =
    book.shortDescription?.trim() ||
    `${book.title} — ${BRAND_NAME}'da okuyun.`

  return {
    url,
    title: book.title,
    description,
    imageUrl: book.cover ?? null,
  }
}

export function openSharePopup(shareUrl: string): void {
  if (typeof window === 'undefined') return
  window.open(shareUrl, '_blank', 'noopener,noreferrer,width=640,height=720')
}

function shareText(payload: SharePayload): string {
  return payload.description
    ? `${payload.title}\n\n${payload.description}`
    : payload.title
}

export function shareToX(payload: SharePayload): void {
  const params = new URLSearchParams({
    text: shareText(payload),
    url: payload.url,
  })
  openSharePopup(`https://twitter.com/intent/tweet?${params.toString()}`)
}

export function shareToFacebook(payload: SharePayload): void {
  const params = new URLSearchParams({ u: payload.url })
  openSharePopup(
    `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
  )
}

export function shareToWhatsApp(payload: SharePayload): void {
  const text = `${shareText(payload)}\n${payload.url}`
  openSharePopup(`https://wa.me/?text=${encodeURIComponent(text)}`)
}

export function shareToTelegram(payload: SharePayload): void {
  const params = new URLSearchParams({
    url: payload.url,
    text: shareText(payload),
  })
  openSharePopup(`https://t.me/share/url?${params.toString()}`)
}

export function shareToLinkedIn(payload: SharePayload): void {
  const params = new URLSearchParams({ url: payload.url })
  openSharePopup(
    `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
  )
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function nativeShare(payload: SharePayload): Promise<boolean> {
  if (!canUseNativeShare()) return false
  try {
    await navigator.share({
      title: payload.title,
      text: payload.description,
      url: payload.url,
    })
    return true
  } catch {
    return false
  }
}

export async function copyShareLink(url: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
