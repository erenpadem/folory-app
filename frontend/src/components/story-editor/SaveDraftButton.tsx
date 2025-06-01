// components/story-editor/save-draft-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function SaveDraftButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      className="w-full gap-2"
      onClick={onClick}
    >
      <Icons.save className="h-4 w-4" />
      Taslak Kaydet
    </Button>
  )
}