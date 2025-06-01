// components/story-editor/publish-button.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function PublishButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      className="w-full gap-2"
      onClick={onClick}
    >
      <Icons.upload className="h-4 w-4" />
      Hikayeyi Yayınla
    </Button>
  )
}