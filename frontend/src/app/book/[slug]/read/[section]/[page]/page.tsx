// app/book/[slug]/read/[section]/[page]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Settings,
  Menu,
  BookOpen,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ReadingSettings,
  type ScreenFilter,
} from '@/components/reading/ReadingSettings'
import {
  ReaderSinglePage,
  type ReaderPageSlot,
} from '@/components/reading/ReaderSinglePage'
import { BookEntity, SectionEntity, PageEntity } from '@/features/books'
import api from '@/shared/lib/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { recordBookViewOnce } from '@/lib/book-view'
import {
  debouncedPatchReadingProgress,
  setSessionReading,
} from '@/lib/book-reading-progress'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import { cn } from '@/lib/utils'

function sortBookPages(pages: PageEntity[]): PageEntity[] {
  return [...pages].sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a.id - b.id
  )
}

/** Tüm okuyucu köküne; unmount ile kalkar. Mavi ışık ayrı fixed katman. */
function readerRouteToneClass(filter: ScreenFilter): string {
  if (filter === 'sepia') return 'reader-tone-route-sepia'
  if (filter === 'night') return 'reader-tone-route-night'
  return ''
}

function readerShowBlueLightOverlay(filter: ScreenFilter): boolean {
  return filter === 'blue-light'
}

const READER_IMMERSIVE_PREFIX = 'folory.reader.immersive.'

export default function BookReader() {
  const { slug, section: sectionParam, page: pageParam } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const slugStr = String(slug ?? '')
  const immersiveStorageKey = `${READER_IMMERSIVE_PREFIX}${slugStr}`

  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [screenFilter, setScreenFilter] = useState<ScreenFilter>('none')
  const [immersive, setImmersive] = useState(false)

  /** Sayfa değişince route yeniden mount olur; okuma modu sessionStorage ile sürer */
  const setImmersivePersisted = useCallback(
    (next: boolean) => {
      setImmersive(next)
      if (typeof window === 'undefined' || !slugStr) return
      try {
        if (next) sessionStorage.setItem(immersiveStorageKey, '1')
        else sessionStorage.removeItem(immersiveStorageKey)
      } catch {
        /* private mode vb. */
      }
    },
    [immersiveStorageKey, slugStr]
  )

  useLayoutEffect(() => {
    if (!slugStr) return
    try {
      setImmersive(sessionStorage.getItem(immersiveStorageKey) === '1')
    } catch {
      setImmersive(false)
    }
  }, [immersiveStorageKey, slugStr])
  const [currentPage, setCurrentPage] = useState<PageEntity | null>(null)
  const [currentSection, setCurrentSection] = useState<SectionEntity | null>(null)
  const [book, setBook] = useState<BookEntity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [pageBookmarked, setPageBookmarked] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const { data: bookData, isLoading: isQueryLoading } = useQuery({
    queryKey: ['book', slug],
    queryFn: async () => {
      const response = await api.get(`/api/books/${slug}?include=sections`)
      return response.data
    },
    enabled: !!slug,
  })

  useEffect(() => {
    if (bookData?.data) {
      const bookDataItem = bookData.data
      const bookEntity = BookEntity.fromPrimitives(bookDataItem)
      setBook(bookEntity)

      if (bookEntity.id && slug) {
        void recordBookViewOnce(
          bookEntity.id,
          String(slug),
          queryClient,
          ['book', slug]
        )
      }

      const sectionId = Number(sectionParam)
      const pageId = Number(pageParam)
      const section = bookEntity.sections.find((s) => s.id === sectionId)
      const isOwner =
        user != null && Number(user.id) === Number(bookEntity.authorId)

      if (section && !section.isVisible && !isOwner) {
        setError('Bu bölüm okuyuculara gösterilmiyor.')
        setIsLoading(false)
        return
      }

      if (section) {
        setCurrentSection(section)
        const page = section.pages.find((p) => p.id === pageId)
        if (page) {
          setCurrentPage(page)
          setError(null)
          setIsLoading(false)
          return
        }
      }

      setError('İstenilen sayfa veya bölüm bulunamadı.')
      setIsLoading(false)
    } else if (!isQueryLoading && !bookData) {
      setError('Kitap yüklenemedi.')
      setIsLoading(false)
    }
  }, [bookData, sectionParam, pageParam, isQueryLoading, user, queryClient, slug])

  const requireAuth = () => {
    if (user) return true
    router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
    return false
  }

  useEffect(() => {
    if (!user || !currentPage) {
      setPageBookmarked(false)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const res = await api.get(`/api/bookmarks/page/${currentPage.id}/check`)
        if (!cancelled) setPageBookmarked(Boolean(res.data?.is_bookmarked))
      } catch {
        if (!cancelled) setPageBookmarked(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, currentPage?.id])

  const togglePageBookmark = async () => {
    if (!currentPage || !requireAuth()) return
    try {
      if (pageBookmarked) {
        await api.delete(`/api/bookmarks/${currentPage.id}`)
        setPageBookmarked(false)
      } else {
        await api.post('/api/bookmarks', { page_id: currentPage.id })
        setPageBookmarked(true)
      }
    } catch {
      // interceptor
    }
  }

  const readableSections = useMemo(() => {
    if (!book) return []
    const isOwner = user != null && Number(user.id) === Number(book.authorId)
    const list = book.sections.filter((s) => s.isVisible || isOwner)
    return [...list].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.id - b.id
    })
  }, [book, user])

  useEffect(() => {
    if (!book || !currentSection || !currentPage || !slug) return
    const slugStr = String(slug)
    const total = readableSections.reduce(
      (acc, s) => acc + sortBookPages(s.pages).length,
      0
    )
    let pageNumber = 0
    for (const section of readableSections) {
      if (section.id === currentSection.id) {
        const idx = sortBookPages(section.pages).findIndex(
          (p) => p.id === currentPage.id
        )
        pageNumber += idx + 1
        break
      }
      pageNumber += sortBookPages(section.pages).length
    }
    const pct = total > 0 ? (pageNumber / total) * 100 : 0
    setSessionReading(slugStr, currentSection.id, currentPage.id)
    if (user && book.id) {
      debouncedPatchReadingProgress(book.id, currentSection.id, currentPage.id, pct)
    }
  }, [book, currentSection, currentPage, slug, user, readableSections])

  const goToPage = (sectionId: number, pageId: number) => {
    router.push(`/book/${slug}/read/${sectionId}/${pageId}`)
  }

  const flatReaderPages = useMemo((): ReaderPageSlot[] => {
    if (!book || readableSections.length === 0) return []
    const out: ReaderPageSlot[] = []
    let n = 0
    for (const section of readableSections) {
      for (const page of sortBookPages(section.pages)) {
        n += 1
        out.push({ section, page, indexOneBased: n })
      }
    }
    return out
  }, [book, readableSections])

  const nextPage = () => {
    if (!currentPage || !currentSection || !book || flatReaderPages.length === 0) {
      return
    }
    const idx = flatReaderPages.findIndex(
      (slot) =>
        slot.page.id === currentPage.id && slot.section.id === currentSection.id
    )
    if (idx < 0) return
    if (idx + 1 >= flatReaderPages.length) return
    const t = flatReaderPages[idx + 1]!
    goToPage(t.section.id, t.page.id)
  }

  const prevPage = () => {
    if (!currentPage || !currentSection || !book || flatReaderPages.length === 0) {
      return
    }
    const idx = flatReaderPages.findIndex(
      (slot) =>
        slot.page.id === currentPage.id && slot.section.id === currentSection.id
    )
    if (idx < 0) return
    if (idx < 1) return
    const t = flatReaderPages[idx - 1]!
    goToPage(t.section.id, t.page.id)
  }

  const getTotalPages = () => {
    if (!book) return 0
    return readableSections.reduce(
      (total, section) => total + sortBookPages(section.pages).length,
      0
    )
  }

  const getCurrentPageNumber = () => {
    if (!book || !currentSection || !currentPage) return 0
    let pageNumber = 0
    for (const section of readableSections) {
      const pagesOrdered = sortBookPages(section.pages)
      if (section.id === currentSection.id) {
        const pageIndex = pagesOrdered.findIndex((p) => p.id === currentPage.id)
        return pageNumber + pageIndex + 1
      }
      pageNumber += pagesOrdered.length
    }
    return pageNumber
  }

  const readerNavRef = useRef({ next: () => {}, prev: () => {} })
  readerNavRef.current.next = nextPage
  readerNavRef.current.prev = prevPage

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === 'Escape' && immersive) {
        e.preventDefault()
        setImmersivePersisted(false)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        readerNavRef.current.next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        readerNavRef.current.prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [immersive, setImmersivePersisted])

  useEffect(() => {
    if (immersive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [immersive])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button variant="outline" onClick={() => router.push(`/book/${slug}`)}>
            Kitap Sayfasına Dön
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading || !currentPage || !currentSection || !book) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted" />
          <p>Sayfa yükleniyor...</p>
        </div>
      </div>
    )
  }

  const totalPages = getTotalPages()
  const currentPageNumber = getCurrentPageNumber()
  const progress = totalPages > 0 ? (currentPageNumber / totalPages) * 100 : 0

  const currentFlatIndex = flatReaderPages.findIndex(
    (slot) =>
      slot.page.id === currentPage.id && slot.section.id === currentSection.id
  )
  const canGoNextReader =
    currentFlatIndex >= 0 && currentFlatIndex + 1 < flatReaderPages.length
  const canGoPrevReader = currentFlatIndex > 0

  const currentSlot: ReaderPageSlot = {
    section: currentSection,
    page: currentPage,
    indexOneBased: currentPageNumber,
  }

  const routeToneClass = readerRouteToneClass(screenFilter)
  const blueLightOverlay = readerShowBlueLightOverlay(screenFilter)

  return (
    <div
      className={cn(
        'book-reader-route reader-desk relative flex min-h-dvh min-h-svh flex-col text-foreground',
        routeToneClass,
        immersive &&
          'fixed inset-0 z-[100] min-h-[100dvh] w-screen max-w-none overflow-hidden'
      )}
    >
      {blueLightOverlay && (
        <div className="reader-blue-light-overlay" aria-hidden />
      )}
      {!immersive && (
        <header className="z-20 shrink-0 border-b border-border/60 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[min(1600px,98vw)] items-center justify-between gap-3 px-3 py-3 sm:px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => router.push(`/book/${slug}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kitap</span>
              </Button>
              <div className="min-w-0 border-l border-border/60 pl-2 sm:pl-3">
                <p className="truncate font-serif text-sm font-semibold text-foreground sm:text-base">
                  {book.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                  Tek sayfa okuma · İlerleme altta · Okuma modu tam ekran
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Okuma modu"
                aria-pressed={immersive}
                title="Tam ekran okuma (Esc ile çık)"
                onClick={() => setImmersivePersisted(true)}
              >
                <BookOpen className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="İçindekiler"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-96 w-72 overflow-y-auto">
                  {readableSections.map((section) => (
                    <div key={section.id} className="py-1">
                      <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </div>
                      {sortBookPages(section.pages).map((page, pi) => (
                        <DropdownMenuItem
                          key={page.id}
                          onClick={() => goToPage(section.id, page.id)}
                          className={`flex flex-col items-start ${
                            page.id === currentPage.id ? 'bg-accent' : ''
                          }`}
                        >
                          <span className="font-medium">Sayfa {pi + 1}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Okuma ayarları"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => void togglePageBookmark()}
                aria-pressed={pageBookmarked}
                title={
                  user
                    ? 'Bu sayfayı yer imlerine ekle / kaldır'
                    : 'Yer imi için giriş yapın'
                }
              >
                <Bookmark
                  className={`h-4 w-4 ${pageBookmarked ? 'fill-current' : ''}`}
                />
              </Button>
            </div>
          </div>
        </header>
      )}

      {immersive && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute right-3 top-3 z-[130] gap-1.5 rounded-full shadow-md sm:right-4 sm:top-4"
          onClick={() => setImmersivePersisted(false)}
          aria-label="Okuma modundan çık"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Kapat</span>
        </Button>
      )}

      {showSettings && !immersive && (
        <div className="relative z-20 mx-auto w-full max-w-[min(1600px,98vw)] px-3 py-3 sm:px-5">
          <div className="rounded-lg border border-border/60 bg-card/95 p-4 shadow-sm">
            <ReadingSettings
              fontSize={fontSize}
              lineHeight={lineHeight}
              screenFilter={screenFilter}
              onFontSizeChange={setFontSize}
              onLineHeightChange={setLineHeight}
              onScreenFilterChange={setScreenFilter}
            />
          </div>
        </div>
      )}

      <main
        className={cn(
          'relative z-0 flex min-h-0 flex-1 flex-col',
          'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]',
          immersive && 'pt-12'
        )}
      >
        <div className="mx-auto flex min-h-0 w-full max-w-full flex-1 justify-center px-3 sm:px-5">
          <ReaderSinglePage
            slot={currentSlot}
            fontSize={fontSize}
            lineHeight={lineHeight}
            className={immersive ? 'max-w-[min(42rem,92vw)]' : undefined}
          />
        </div>
      </main>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'fixed z-[112] h-11 w-11 rounded-full border-border bg-background/90 shadow-md backdrop-blur-sm sm:h-12 sm:w-12',
          'left-[max(0.5rem,env(safe-area-inset-left))] top-1/2 -translate-y-1/2 sm:left-3 md:left-4'
        )}
        onClick={prevPage}
        disabled={!canGoPrevReader}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'fixed z-[112] h-11 w-11 rounded-full border-border bg-background/90 shadow-md backdrop-blur-sm sm:h-12 sm:w-12',
          'right-[max(0.5rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2 sm:right-3 md:right-4'
        )}
        onClick={nextPage}
        disabled={!canGoNextReader}
        aria-label="Sonraki sayfa"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      <footer
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[112]',
          'border-t border-border/60 bg-background/95 backdrop-blur-md',
          'pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2'
        )}
      >
        <div className="w-full px-4 sm:px-6">
          <Progress value={progress} className="h-1.5 rounded-full bg-muted/60" />
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground sm:text-xs">
            <span>%{Math.round(progress)} okundu</span>
            <span>
              Sayfa {currentPageNumber} / {totalPages}
              <span className="hidden sm:inline"> · ← →</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
