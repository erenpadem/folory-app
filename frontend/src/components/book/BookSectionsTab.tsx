// components/book/BookSectionsTab.tsx
'use client'

import { SectionItem } from "./SectionItem"
import { BookEntity } from "@/features/books"
import { useRouter } from "next/navigation"
import { SurfacePanel } from '@/components/ui/surface-panel'

interface BookSectionsTabProps {
  book: BookEntity
}

export function BookSectionsTab({ book }: BookSectionsTabProps) {
  const router = useRouter()

  const handleSectionClick = (sectionId: number, pageId: number) => {
    const bookSlug = book.slug || String(book.id)
    router.push(`/book/${bookSlug}/read/${sectionId}/${pageId}`)
  }

  const visibleCount = book.sections.filter((s) => s.isVisible).length

  return (
    <SurfacePanel>
      <h3 className="text-lg font-semibold tracking-tight md:text-xl">
        Bölümler ({visibleCount})
      </h3>
      <div className="mt-4 space-y-2">
        {[...book.sections]
          .filter((section) => section.isVisible)
          .sort((a, b) => a.order - b.order || a.id - b.id)
          .map((section) => (
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

