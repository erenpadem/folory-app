// components/story/StoryChaptersTab.tsx
'use client'

import { ChapterItem } from "./ChapterItem"
import { useStoryEditorStore } from "@/stores/story.store"

export function StoryChaptersTab() {
  const { story } = useStoryEditorStore()

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Bölümler ({story.chapters.length})</h3>
      <div className="space-y-2">
        {story.chapters.map((chapter) => (
          <ChapterItem key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  )
}