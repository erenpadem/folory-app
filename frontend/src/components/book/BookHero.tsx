// components/book/BookHero.tsx
'use client'

import { BookStarRating } from "./BookStarRating"
import { Bookmark, Eye, Heart, MoreVertical, Play, FlagIcon, UserIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookShareDialog } from "@/components/book/BookShareDialog"
import { BookEntity } from "@/features/books"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { ReadingPosition } from "@/lib/book-reading-progress"

interface BookHeroProps {
  book: BookEntity
  isSaved: boolean
  isLiked: boolean
  isOwner?: boolean
  onSave: () => void
  onLike: () => void
  showFullDescription: boolean
  onToggleDescription: () => void
  resumeReading?: ReadingPosition | null
  onRated?: () => void
  onClearHistory?: () => void
}

export function BookHero({ 
  book, 
  isSaved, 
  isLiked, 
  isOwner = false,
  onSave, 
  onLike, 
  showFullDescription,
  onToggleDescription,
  resumeReading = null,
  onRated,
  onClearHistory,
}: BookHeroProps) {
  const router = useRouter()

  const bookSlug = book.slug || String(book.id)

  const handleReadOrContinue = () => {
    if (resumeReading) {
      router.push(
        `/book/${bookSlug}/read/${resumeReading.sectionId}/${resumeReading.pageId}`
      )
      return
    }
    const ordered = [...book.sections].sort((a, b) => a.order - b.order)
    const firstReadable =
      ordered.find((s) => s.isVisible && s.pages.length > 0) ||
      ordered.find((s) => s.pages.length > 0)
    if (firstReadable && firstReadable.pages.length > 0) {
      const firstPage = firstReadable.pages[0]
      router.push(`/book/${bookSlug}/read/${firstReadable.id}/${firstPage.id}`)
    }
  }

  const readCtaLabel = resumeReading ? 'Okumaya Devam Et' : 'Okumaya Başla'

  const goToAuthorProfile = () => {
    if (book.authorUsername) {
      router.push(`/profile/${book.authorUsername}`)
      return
    }
    toast.error('Yazar profili bulunamadı')
  }

  const handleReport = () => {
    const subject = encodeURIComponent(`Şikayet: ${book.title}`)
    const body = encodeURIComponent(
      `Kitap: ${book.title}\nURL: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nŞikayetinizi buraya yazın:`
    )
    window.location.href = `mailto:destek@fo-lory.com?subject=${subject}&body=${body}`
  }

  const handleClearHistory = () => {
    onClearHistory?.()
    toast.success('Okuma geçmişi temizlendi')
  }

  /** Reader-facing counts: only visible sections */
  const visibleSections = book.sections.filter((s) => s.isVisible)
  const totalPages = visibleSections.reduce((total, section) => total + section.pages.length, 0)

  return (
    <div className="container pb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Cover */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg bg-muted">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <span className="text-lg text-muted-foreground">Kapak Resmi Yok</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
              <Button className="w-full gap-2" onClick={handleReadOrContinue}>
                <Play className="h-4 w-4" />
                {readCtaLabel}
              </Button>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{book.title}</h1>
              <p className="text-lg text-muted-foreground">
                {book.authorUsername ? (
                  <button
                    type="button"
                    className="hover:text-foreground hover:underline transition-colors"
                    onClick={goToAuthorProfile}
                  >
                    {book.authorName ?? book.authorUsername}
                  </button>
                ) : (
                  book.authorName ?? 'Yazar bilgisi yok'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onSave}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </Button>

              <BookShareDialog book={book} />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Diğer İşlemler</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-1 py-2">
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={handleReport}
                      >
                        <FlagIcon className="h-4 w-4" />
                        Şikayet Et
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={handleClearHistory}
                      >
                        <TrashIcon className="h-4 w-4" />
                        Geçmişi Temizle
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={goToAuthorProfile}
                        disabled={!book.authorUsername}
                      >
                        <UserIcon className="h-4 w-4" />
                        Yazar Profili
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.isAdult && (
              <Badge variant="secondary">+18</Badge>
            )}
            {book.isPublished ? (
              <Badge variant="default">Yayında</Badge>
            ) : (
              <Badge variant="outline">Taslak</Badge>
            )}
            <Badge variant="secondary">{visibleSections.length} Bölüm</Badge>
            <Badge variant="secondary">{totalPages} Sayfa</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-5 w-5 shrink-0" aria-hidden />
              <span className="tabular-nums">{book.readCount}</span>
              <span className="text-sm">okunma</span>
            </div>
            <BookStarRating
              bookId={book.id}
              averageRating={book.averageRating}
              ratingCount={book.ratingCount}
              canRate={!isOwner}
              onRated={onRated}
            />
            {!isOwner && (
              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={onLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  Beğen
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className={`text-muted-foreground ${showFullDescription ? '' : 'line-clamp-3'}`}>
              {book.shortDescription || 'Açıklama bulunmuyor.'}
            </p>
            {book.shortDescription && book.shortDescription.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm"
                onClick={onToggleDescription}
              >
                {showFullDescription ? 'Daha az göster' : 'Devamını oku'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Son Güncelleme</p>
              <p className="font-medium">{book.updatedAt.toLocaleDateString('tr-TR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yayın Tarihi</p>
              <p className="font-medium">{book.createdAt.toLocaleDateString('tr-TR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Sayfa</p>
              <p className="font-medium">{totalPages}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bölüm Sayısı</p>
              <p className="font-medium">{visibleSections.length}</p>
            </div>
          </div>

          <div className="pt-4">
            <Button size="lg" className="gap-2" onClick={handleReadOrContinue}>
              <Play className="h-5 w-5" />
              {readCtaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

