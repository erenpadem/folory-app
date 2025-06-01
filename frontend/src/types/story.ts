export type Comment = {
  id: string
  user: string
  avatar: string
  date: string
  text: string
  likes: number
  replies?: Comment[]
  isExpanded?: boolean
}

// types/story.ts
export type Chapter = {
  id: string
  title: string
  content: string
  wordCount: number
  status: 'draft' | 'published'
  number?: number // opsiyonel, eğer bölüm numarası kullanacaksanız
  publishedAt?: string // opsiyonel
}

export type Story = {
  id: string
  slug: string
  title: string
  author: string
  description: string
  cover: string
  genre: string
  likes: number
  chapters: Chapter[]
  rating: number
  status: string
  wordCount: number
  publishedDate: string
  lastUpdated: string
  similarStories: {
      id: string
      slug: string
      title: string
      author: string
      cover: string
  }[]
  comments: Comment[]
  readingProgress?: {
      currentChapter: number
      percentage: number
  }
}

export type StoryStatus = 'draft' | 'published' | 'archived'
export type Visibility = 'public' | 'unlisted' | 'private'