'use client'

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useStoryEditorStore } from "@/stores/story.store"
import { Chapter } from "@/types/story"

interface ChapterItemProps {
  chapter: Chapter
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

export function ChapterItem({ chapter, isActive, onSelect, onDelete }: ChapterItemProps) {
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${
      isActive ? 'bg-accent' : 'bg-background'
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full">
          {chapter.position}
        </div>
        <div>
          <p className="font-medium">{chapter.title}</p>
          <p className="text-sm text-muted-foreground">
            {chapter.word_count} kelime • ~{chapter.reading_time} dakika
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSelect}>
          <Icons.edit className="h-4 w-4 mr-2" />
          Düzenle
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Icons.trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}