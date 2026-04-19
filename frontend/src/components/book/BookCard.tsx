'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { BookOpen, Eye, MoreVertical, Star } from 'lucide-react'
import Image from 'next/image'

interface BookCardProps {
  book: {
    id: number
    slug?: string
    title: string
    cover?: string | null
    short_description?: string | null
    read_count?: number
    is_draft?: boolean
    is_published?: boolean
    rating?: number | null
    category?: {
      name: string
    } | null
    author?: {
      name: string
    } | null
  }
  /** Override default public reader URL (e.g. author dashboard → edit) */
  href?: string
  /** In-dashboard: kart tıklanınca düzenleme; menü (Görüntüle, Düzenle, Sil). */
  dashboardActions?: {
    viewHref: string
    editHref: string
    onDelete: () => Promise<void>
  }
}

function DeleteBookDialog({
  open,
  onOpenChange,
  bookTitle,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookTitle: string
  onConfirm: () => Promise<void>
}) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setConfirmText('')
      setLoading(false)
    }
  }, [open])

  const trimmed = confirmText.trim()
  const titleTrimmed = bookTitle.trim()
  const canConfirm = trimmed.length > 0 && trimmed === titleTrimmed

  const handleConfirm = async () => {
    if (!canConfirm || loading) return
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Silmek istediğinden emin misin?</DialogTitle>
          <DialogDescription>
            Onayı tamamlamak için aşağıya kitabın adını aynen yaz.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Kitap adı: <span className="font-medium text-foreground">{bookTitle}</span>
          </p>
          <Input
            autoComplete="off"
            placeholder="Kitap adını yazın"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="bg-red-500 hover:bg-red-600 focus-visible:ring-red-500/30 shadow-sm"
          >
            Evet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BookCard({ book, href, dashboardActions }: BookCardProps) {
  const bookSlug = book.slug || book.id
  const cardHref = href ?? `/book/${bookSlug}`
  const [deleteOpen, setDeleteOpen] = useState(false)

  const cardInner = (
    <>
      <CardHeader className="p-0">
        <div className="aspect-[3/4] relative bg-muted">
          {book.cover ? (
            <Image
              src={book.cover}
              alt={book.title}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {dashboardActions && (
            <div
              className="absolute top-2 right-2 z-10"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md"
                    aria-label="Kitap işlemleri"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link href={dashboardActions.viewHref}>Görüntüle</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={dashboardActions.editHref}>Düzenle</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                      setDeleteOpen(true)
                    }}
                  >
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{book.title}</h3>
        {book.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {book.short_description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {book.category && (
            <Badge variant="secondary">{book.category.name}</Badge>
          )}
          {book.is_published ? (
            <Badge variant="default">Yayında</Badge>
          ) : (
            <Badge variant="outline">Taslak</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{book.read_count || 0}</span>
          </div>
          {book.rating !== null && book.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{book.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {book.author && (
          <span className="line-clamp-1">{book.author.name}</span>
        )}
      </CardFooter>
    </>
  )

  if (dashboardActions) {
    return (
      <>
        <Link
          href={dashboardActions.editHref}
          className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="hover:shadow-lg transition-shadow h-full flex flex-col relative cursor-pointer">
            {cardInner}
          </Card>
        </Link>
        <DeleteBookDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          bookTitle={book.title}
          onConfirm={dashboardActions.onDelete}
        />
      </>
    )
  }

  return (
    <Link href={cardHref}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {cardInner}
      </Card>
    </Link>
  )
}
