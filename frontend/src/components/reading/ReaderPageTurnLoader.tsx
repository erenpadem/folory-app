'use client'

import { cn } from '@/lib/utils'

export function ReaderPageTurnLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role="status"
      aria-label="Sayfa değiştiriliyor"
    >
      <div className="reader-page-turn-loader" aria-hidden>
        <div className="reader-page-turn-loader__stack">
          <div className="reader-page-turn-loader__page reader-page-turn-loader__page--back" />
          <div className="reader-page-turn-loader__page reader-page-turn-loader__page--turning" />
          <div className="reader-page-turn-loader__page reader-page-turn-loader__page--front" />
        </div>
      </div>
    </div>
  )
}
