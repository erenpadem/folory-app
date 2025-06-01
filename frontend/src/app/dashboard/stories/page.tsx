
import { EmptyState } from '@/components/story/EmptyState'
import { StoryCard } from '@/components/story/StoryCard'
import { Button } from '@/components/ui/button'
import { fetchUserStories } from '@/lib/story/api'
import Link from 'next/link'

export default async function StoriesDashboard() {
  const stories = await fetchUserStories() // API call

  return (
    <div className="container py-8">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Hikayelerim</h1>
        <Button asChild>
          <Link href="/dashboard/stories/new">Yeni Hikaye</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {stories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                actions={[
                  { label: 'Düzenle', href: `/dashboard/stories/${story.id}/edit` },
                  { label: 'İstatistikler', href: `/dashboard/stories/${story.id}/stats` }
                ]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}