'use client'

import { ChapterView } from '@/components/reading/ChapterView'
import type { PageEntity, SectionEntity } from '@/features/books'
import { cn } from '@/lib/utils'

export type ReaderPageSlot = {
  section: SectionEntity
  page: PageEntity
  /** Kitap genelinde 1 tabanlı sayfa numarası */
  indexOneBased: number
}

function PageFolio({ n }: { n: number }) {
  return (
    <div
      className="reader-page-folio pointer-events-none shrink-0 select-none py-4 text-center font-serif text-[0.8125rem] tabular-nums tracking-wide"
      aria-hidden
    >
      {n}
    </div>
  )
}

export function ReaderSinglePage({
  slot,
  fontSize,
  lineHeight,
  className,
}: {
  slot: ReaderPageSlot
  fontSize: number
  lineHeight: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'reader-page-paper mx-auto flex min-h-0 w-full max-w-[42rem] flex-1 flex-col rounded-xl px-5 py-6 sm:px-8 sm:py-8',
        className
      )}
    >
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-soft px-1 sm:px-2">
        <ChapterView
          content={slot.page.content}
          fontSize={fontSize}
          lineHeight={lineHeight}
          variant="default"
        />
      </div>
      <PageFolio n={slot.indexOneBased} />
    </div>
  )
}
