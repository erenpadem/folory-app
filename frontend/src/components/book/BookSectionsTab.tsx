// components/book/BookSectionsTab.tsx
'use client'

import { SectionItem } from "./SectionItem"
import { BookEntity } from "@/features/books"
import { useRouter } from "next/navigation"
import { SurfacePanel } from '@/components/ui/surface-panel'
import { pageHasWrittenContent } from '@/lib/page-content'

function readablePages(section: BookEntity['sections'][number]) {
  return section.pages.filter((page) => pageHasWrittenContent(page.content))
}

interface BookSectionsTabProps {
  book: BookEntity
}

export function BookSectionsTab({ book }: BookSectionsTabProps) {
  const router = useRouter()

  const handleSectionClick = (sectionId: number, pageId: number) => {
    const bookSlug = book.slug || String(book.id)
    router.push(`/book/${bookSlug}/read/${sectionId}/${pageId}`)
  }

  const visibleSections = book.sections
    .filter((section) => section.isVisible)
    .filter((section) => readablePages(section).length > 0)
    .sort((a, b) => a.order - b.order || a.id - b.id)

  return (
    <SurfacePanel>
      <h3 className="text-lg font-semibold tracking-tight md:text-xl">
        Bölümler ({visibleSections.length})
      </h3>
      <div className="mt-4 space-y-2">
        {visibleSections.map((section) => (
            <SectionItem 
              key={section.id} 
              section={section}
              onSelect={(pageId) => handleSectionClick(section.id, pageId)}
            />
          ))}
      </div>
    </SurfacePanel>
  )
}

