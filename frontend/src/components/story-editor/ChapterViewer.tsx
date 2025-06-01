// components/story-editor/chapter-viewer.tsx
'use client'

import { cn } from '@/lib/utils'

export function ChapterViewer({ content }: { content: string }) {
  return (
    <div className={cn(
      "prose prose-sm dark:prose-invert max-w-none",
      "prose-p:leading-relaxed prose-pre:p-0",
      "prose-headings:font-serif prose-headings:font-medium",
      "prose-blockquote:border-l-4 prose-blockquote:border-primary",
      "prose-img:rounded-lg"
    )}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}