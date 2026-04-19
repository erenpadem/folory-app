// components/book/BookAboutTab.tsx
'use client'

import { BookEntity } from "@/features/books"
import { SurfacePanel } from '@/components/ui/surface-panel'

interface BookAboutTabProps {
  book: BookEntity
}

export function BookAboutTab({ book }: BookAboutTabProps) {
  const hasDescription =
    book.shortDescription != null && String(book.shortDescription).trim() !== ''

  return (
    <SurfacePanel>
      <h3 className="text-lg font-semibold tracking-tight md:text-xl">Kitap Hakkında</h3>
      <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">
        <p
          className={
            hasDescription ? 'text-foreground/95' : 'text-muted-foreground italic'
          }
        >
          {hasDescription ? book.shortDescription : 'Açıklama bulunmuyor.'}
        </p>
      </div>
    </SurfacePanel>
  )
}

