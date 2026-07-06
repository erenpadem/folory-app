'use client'

import { Button } from "@/components/ui/button"
import { SectionEntity } from "@/features/books"
import { BookOpen, ChevronRight } from "lucide-react"
import { pageHasWrittenContent } from "@/lib/page-content"

interface SectionItemProps {
  section: SectionEntity
  onSelect: (pageId: number) => void
}

export function SectionItem({ section, onSelect }: SectionItemProps) {
  const readable = section.pages.filter((page) => pageHasWrittenContent(page.content))

  const handleClick = () => {
    if (readable.length > 0) {
      onSelect(readable[0]!.id)
    }
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-lg border border-border/35 bg-background/55 p-4 transition-colors hover:bg-muted/40 dark:border-border/40 dark:bg-background/25 dark:hover:bg-muted/30"
      onClick={handleClick}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 dark:bg-muted/50">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{section.title}</p>
          <p className="text-sm text-muted-foreground">
            {readable.length} sayfa
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

