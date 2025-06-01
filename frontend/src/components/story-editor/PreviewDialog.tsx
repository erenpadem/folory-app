// components/story-editor/PreviewDialog.tsx
'use client'

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { ChapterView } from '@/components/reading/ChapterView'
import Image from 'next/image'
import { Chapter } from '@/types/story'
import { ChapterViewer } from './ChapterViewer'

export function PreviewDialog({
  isOpen,
  onClose,
  chapter,
  chapters,
  storyInfo,
}: {
  isOpen: boolean
  onClose: () => void
  chapter: Chapter | null
  chapters: Chapter[]
  storyInfo: StoryInfo
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Kapak resmi gösterimi */}
        {storyInfo.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={storyInfo.coverImage}
              alt="Cover"
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 p-6">
          {/* Hikaye bilgileri */}
          <DialogHeader className="text-center mb-6">
            <h1 className="text-3xl font-bold">{storyInfo.title}</h1>
            <p className="text-muted-foreground mt-2">{storyInfo.description}</p>
          </DialogHeader>

          {/* Chapter içeriği */}
          {chapter && (
            <ChapterViewer content={chapter.content} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}