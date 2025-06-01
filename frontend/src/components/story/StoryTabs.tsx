import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StoryAboutTab } from "./StoryAboutTab"
import { StoryChaptersTab } from "./StoryChaptersTab"
import { StoryCommentsTab } from "./StoryCommentsTab"
import { Story } from "@/types/story"

interface StoryTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  story: Story
}

export function StoryTabs({ activeTab, onTabChange, story }: StoryTabsProps) {
  return (
    <div className="container pb-8">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">Hikaye</TabsTrigger>
          <TabsTrigger value="chapters">Bölümler</TabsTrigger>
          <TabsTrigger value="comments">Yorumlar ({story.comments.length})</TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="about">
            <StoryAboutTab story={story} />
          </TabsContent>

          <TabsContent value="chapters">
            <StoryChaptersTab story={story} />
          </TabsContent>

          <TabsContent value="comments">
            <StoryCommentsTab story={story} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}