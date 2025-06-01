// components/chapter-view.tsx
'use client'

import { cn } from '@/lib/utils'

export function ChapterView({
  content,
  fontSize,
  lineHeight,
}: {
  content: string
  fontSize: number
  lineHeight: number
}) {
  return (
    <article 
      className={cn(
        "prose prose-lg dark:prose-invert max-w-none mb-12",
        "prose-headings:font-serif prose-p:font-sans",
        "prose-img:rounded-lg prose-img:shadow-md"
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: lineHeight
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}