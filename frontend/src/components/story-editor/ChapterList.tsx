// components/story-editor/chapter-list.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Chapter } from '@/types'
import { Icons } from '@/components/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function ChapterList({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
  onUpdateChapter,
}: {
  chapters: Chapter[]
  activeChapterId: string | null
  onSelectChapter: (id: string) => void
  onAddChapter: () => void
  onUpdateChapter: (id: string, updates: Partial<Chapter>) => void
}) {
  return (
    <div className="space-y-4">
      <Button onClick={onAddChapter} className="gap-2 w-full">
        <Icons.plus className="h-4 w-4" />
        Yeni Bölüm Ekle
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Durum</TableHead>
            <TableHead>Bölüm</TableHead>
            <TableHead>Kelime</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter) => (
            <TableRow 
              key={chapter.id} 
              className={activeChapterId === chapter.id ? 'bg-accent' : ''}
              onClick={() => onSelectChapter(chapter.id)}
            >
              <TableCell>
                <Badge variant={chapter.status === 'published' ? 'default' : 'outline'}>
                  {chapter.status === 'published' ? 'Yayında' : 'Taslak'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="hover:underline cursor-pointer">
                  {chapter.title}
                </div>
              </TableCell>
              <TableCell>{chapter.wordCount}</TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateChapter(chapter.id, { 
                      status: chapter.status === 'published' ? 'draft' : 'published' 
                    })
                  }}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {chapter.status === 'published' ? 'Taslağa Çevir' : 'Yayınla'}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}