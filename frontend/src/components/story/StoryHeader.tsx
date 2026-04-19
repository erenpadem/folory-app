// components/story/StoryHeader.tsx
'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useStoryEditorStore } from "@/stores/story.store"

export function StoryHeader() {
  const { resetStoryState } = useStoryEditorStore()

  return (
    <div className="container py-4">
      <Button variant="ghost" className="gap-2" asChild onClick={resetStoryState}>
        <Link href="/explore">
          <ChevronLeft className="h-4 w-4" />
          Geri Dön
        </Link>
      </Button>
    </div>
  )
}