// components/profile/ProfileStories.tsx
'use client'

import { Story } from '@/types/story'
import { StoryCard } from '../story/StoryCard'
import { EmptyState } from '../story/EmptyState'
import { Skeleton } from '../ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { fetchUserStories } from '@/lib/api/user/api'


interface ProfileStoriesProps {
  userId: string
  isOwnProfile: boolean
}

export const ProfileStories = ({ userId, isOwnProfile }: ProfileStoriesProps) => {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['user-stories', userId],
    queryFn: () => fetchUserStories(userId),
  })

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (!stories || stories.length === 0) {
    return (
      <EmptyState
        title="Hiç hikaye yok"
        description={
          isOwnProfile
            ? 'İlk hikayeni yazmaya ne dersin?'
            : 'Bu kullanıcı henüz hikaye yayınlamadı'
        }
      />
    )
  }

  return (
    <div className="grid gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}