import api from '@/shared/lib/api-client'
import { BookEntity } from '@/features/books'
import { debounce } from '@/hooks/use-debounce'

const STORAGE_PREFIX = 'folory_reading'

export type ReadingPosition = { sectionId: number; pageId: number }

export function sessionReadingKey(slug: string): string {
  return `${STORAGE_PREFIX}_${slug}`
}

export function getSessionReading(slug: string): ReadingPosition | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(sessionReadingKey(slug))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { sectionId?: number; pageId?: number }
    if (
      parsed.sectionId == null ||
      parsed.pageId == null ||
      !Number.isFinite(Number(parsed.sectionId)) ||
      !Number.isFinite(Number(parsed.pageId))
    ) {
      return null
    }
    return { sectionId: Number(parsed.sectionId), pageId: Number(parsed.pageId) }
  } catch {
    return null
  }
}

export function setSessionReading(slug: string, sectionId: number, pageId: number): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      sessionReadingKey(slug),
      JSON.stringify({ sectionId, pageId, savedAt: Date.now() })
    )
  } catch {
    // quota / private mode
  }
}

/**
 * Kayıtlı konum bu kitap yapısında geçerli ve okunabilir mi?
 */
export function resolveResumePosition(
  book: BookEntity,
  pos: ReadingPosition | null,
  viewerUserId: number | null
): ReadingPosition | null {
  if (!pos) return null
  const section = book.sections.find((s) => s.id === pos.sectionId)
  if (!section) return null
  const isOwner = viewerUserId != null && Number(viewerUserId) === Number(book.authorId)
  if (!section.isVisible && !isOwner) return null
  const page = section.pages.find((p) => p.id === pos.pageId)
  if (!page) return null
  return pos
}

export async function patchReadingProgressToApi(
  bookId: number,
  sectionId: number,
  pageId: number,
  progressPercentage: number
): Promise<void> {
  await api.patch(`/api/library/${bookId}/progress`, {
    last_section_id: sectionId,
    last_page_id: pageId,
    progress_percentage: Math.round(progressPercentage * 100) / 100,
  })
}

export const debouncedPatchReadingProgress = debounce(
  (bookId: number, sectionId: number, pageId: number, progressPercentage: number) => {
    void patchReadingProgressToApi(bookId, sectionId, pageId, progressPercentage).catch(() => {
      // sessiz — okuma akışını bozma
    })
  },
  900
)
