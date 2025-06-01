// components/story-editor/chapter-editor.tsx
'use client'

import { Input } from '@/components/ui/input'
import { RichTextEditor } from './RichTextEditor'
import { Chapter } from '@/types/story'

export function ChapterEditor({
  chapter,
  onUpdate,
}: {
  chapter: Chapter
  onUpdate: (content: string) => void
}) {
  return (
    <div className="space-y-4">
      <Input
        value={chapter.title}
        onChange={(e) => onUpdate({ ...chapter, title: e.target.value })}
        placeholder="Bölüm başlığı"
        className="text-lg font-medium"
      />
      <RichTextEditor
        content={chapter.content}
        onUpdate={onUpdate}
      />
    </div>
  )
}