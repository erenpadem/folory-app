// components/story/StoryCard.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  BarChart2, 
  PenSquare,
  MoreVertical 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStoryEditorStore } from '@/stores/story.store'

type StoryCardProps = {
  story: {
    id: string
    title: string
    coverImage?: string
    genre: string
    chaptersCount: number
    wordCount: number
    isPublished: boolean
    updatedAt: string
  }
  actions: Array<{ label: string; href: string }>
}

export function StoryCard({ story, actions }: StoryCardProps) {
  const { setActiveStory } = useStoryEditorStore()

  const handleStorySelect = () => {
    // This would be more complete with actual story data fetching
    setActiveStory({
      id: story.id,
      title: story.title,
      author: "Yazar",
      description: "Hikaye açıklaması",
      cover: story.coverImage || '',
      genre: story.genre,
      status: story.isPublished ? 'published' : 'draft',
      rating: 0,
      likes: 0,
      wordCount: story.wordCount,
      lastUpdated: story.updatedAt,
      publishedDate: story.updatedAt,
      comments: [],
      chapters: Array(story.chaptersCount).fill(0).map((_, i) => ({
        id: `chapter-${i}`,
        title: `Bölüm ${i + 1}`,
        number: i + 1,
        status: 'unread',
        publishedDate: story.updatedAt,
        wordCount: Math.floor(story.wordCount / story.chaptersCount)
      })),
      readingProgress: null
    })
  }

  return (
    <div 
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      onClick={handleStorySelect}
    >
      {/* Cover Image */}
      <div className="aspect-[3/4] relative bg-muted">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold line-clamp-2">{story.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => (
                <DropdownMenuItem key={action.label} asChild>
                  <Link href={action.href} className="cursor-pointer">
                    {action.label === 'Düzenle' && <PenSquare className="mr-2 h-4 w-4" />}
                    {action.label === 'İstatistikler' && <BarChart2 className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{story.genre}</Badge>
          {story.isPublished ? (
            <Badge variant="default">Yayında</Badge>
          ) : (
            <Badge variant="outline">Taslak</Badge>
          )}
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{story.chaptersCount} bölüm</span>
          <span>{story.wordCount.toLocaleString()} kelime</span>
        </div>

        <div className="text-xs text-muted-foreground">
          Son güncelleme: {new Date(story.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}