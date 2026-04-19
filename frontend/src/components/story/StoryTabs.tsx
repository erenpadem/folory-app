// components/story/StoryTabs.tsx
'use client'

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
} from '@/components/ui/app-tabs'
import { StoryAboutTab } from './StoryAboutTab'
import { StoryChaptersTab } from './StoryChaptersTab'
import { StoryCommentsTab } from './StoryCommentsTab'
import { useStoryEditorStore } from '@/stores/story.store'

export function StoryTabs() {
  const { activeTab, setActiveTab, story } = useStoryEditorStore()

  return (
    <div className="container pb-8">
      <AppTabs value={activeTab} onValueChange={setActiveTab}>
        <AppTabsList className="grid w-full grid-cols-3">
          <AppTabsTrigger value="about">Hikaye</AppTabsTrigger>
          <AppTabsTrigger value="chapters">Bölümler</AppTabsTrigger>
          <AppTabsTrigger value="comments">
            Yorumlar ({story.comments.length})
          </AppTabsTrigger>
        </AppTabsList>

        <AppTabsContent value="about">
          <StoryAboutTab />
        </AppTabsContent>

        <AppTabsContent value="chapters">
          <StoryChaptersTab />
        </AppTabsContent>

        <AppTabsContent value="comments">
          <StoryCommentsTab />
        </AppTabsContent>
      </AppTabs>
    </div>
  )
}
