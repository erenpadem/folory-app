// components/story-editor/story-settings.tsx
'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function StorySettings() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Hikaye Görünürlüğü</Label>
        <Select defaultValue="public">
          <SelectTrigger>
            <SelectValue placeholder="Görünürlük seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Herkese Açık</SelectItem>
            <SelectItem value="unlisted">Bağlantısı Olanlar</SelectItem>
            <SelectItem value="private">Yalnızca Ben</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="mature-content">+18 İçerik</Label>
        <Switch id="mature-content" />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="allow-comments">Yorumlara İzin Ver</Label>
        <Switch id="allow-comments" defaultChecked />
      </div>

      <div className="space-y-2">
        <Label htmlFor="copyright">Telif Hakkı</Label>
        <Input id="copyright" placeholder="Telif bilgisi (isteğe bağlı)" />
      </div>
    </div>
  )
}