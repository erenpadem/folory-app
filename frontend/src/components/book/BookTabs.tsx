// components/book/BookTabs.tsx
'use client'

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
} from '@/components/ui/app-tabs'
import { BookAboutTab } from './BookAboutTab'
import { BookSectionsTab } from './BookSectionsTab'
import { BookCommentsTab } from './BookCommentsTab'
import { BookEntity } from '@/features/books'
import { useQuery } from '@tanstack/react-query'
import { fetchBookComments } from '@/lib/book-comments-api'

interface BookTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  book: BookEntity
}

export function BookTabs({ activeTab, onTabChange, book }: BookTabsProps) {
  const { data: commentsPayload } = useQuery({
    queryKey: ['book-comments', book.id],
    queryFn: () => fetchBookComments(book.id),
  })

  const commentsCount = commentsPayload?.total ?? 0

  return (
    <div className="container pb-8">
      <AppTabs value={activeTab} onValueChange={onTabChange}>
        <AppTabsList className="grid w-full grid-cols-3">
          <AppTabsTrigger value="about">Kitap</AppTabsTrigger>
          <AppTabsTrigger value="sections">Bölümler</AppTabsTrigger>
          <AppTabsTrigger value="comments">
            Yorumlar ({commentsCount})
          </AppTabsTrigger>
        </AppTabsList>

        <AppTabsContent value="about">
          <BookAboutTab book={book} />
        </AppTabsContent>

        <AppTabsContent value="sections">
          <BookSectionsTab book={book} />
        </AppTabsContent>

        <AppTabsContent value="comments">
          <BookCommentsTab book={book} />
        </AppTabsContent>
      </AppTabs>
    </div>
  )
}
