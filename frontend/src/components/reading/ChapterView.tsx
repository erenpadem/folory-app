// components/chapter-view.tsx
'use client'

import { cn } from '@/lib/utils'

export function ChapterView({
  content,
  fontSize,
  lineHeight,
  /** Yayılım içi: alt boşluk ve tipografi biraz sıkı */
  variant = 'default',
  className,
}: {
  content: string
  fontSize: number
  lineHeight: number
  variant?: 'default' | 'spread'
  className?: string
}) {
  const isSpread = variant === 'spread'

  return (
    <article 
      className={cn(
        'book-reader-prose prose max-w-none',
        isSpread ? 'prose-base mb-0' : 'prose-lg mb-12',
        'prose-headings:font-serif prose-p:font-sans',
        'prose-img:rounded-lg prose-img:shadow-md',
        className
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}