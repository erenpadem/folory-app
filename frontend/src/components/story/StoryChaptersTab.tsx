import { Story } from "@/types/story"
import { ChapterItem } from "./ChapterItem"

interface StoryChaptersTabProps {
  story: Story
}

export function StoryChaptersTab({ story }: StoryChaptersTabProps) {
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