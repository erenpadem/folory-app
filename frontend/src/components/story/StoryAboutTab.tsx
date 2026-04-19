// components/story/StoryAboutTab.tsx
'use client'

import Image from 'next/image'
import { useStoryEditorStore } from '@/stores/story.store'

export function StoryAboutTab() {
  const { story } = useStoryEditorStore()

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Hikaye Hakkında</h3>
      <div className="prose prose-sm dark:prose-invert">
        <p>{story.description}</p>
      </div>

      {story.similarStories && story.similarStories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Benzer Hikayeler</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {story.similarStories.map((similarStory) => (
              <div key={similarStory.id} className="space-y-2">
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={similarStory.cover}
                    alt={similarStory.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{similarStory.title}</p>
                  <p className="text-sm text-muted-foreground">{similarStory.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}