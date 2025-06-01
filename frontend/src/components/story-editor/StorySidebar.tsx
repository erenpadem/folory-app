// components/story-editor/story-sidebar.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { SaveDraftButton } from './SaveDraftButton'
import { PublishButton } from './PublishButton'


export function StorySidebar({
  onSaveDraft,
  onPublish,
}: {
  onSaveDraft: () => void
  onPublish: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Hızlı Eylemler</h3>
        <div className="space-y-2">
          <SaveDraftButton onClick={onSaveDraft} />
          <PublishButton onClick={onPublish} />
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium">Bölüm İstatistikleri</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Toplam Bölüm</p>
            <p className="font-medium">12</p>
          </div>
          <div>
            <p className="text-muted-foreground">Toplam Kelime</p>
            <p className="font-medium">24,567</p>
          </div>
        </div>
      </div>
    </div>
  )
}