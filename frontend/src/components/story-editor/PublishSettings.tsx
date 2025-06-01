// components/editor/publish-settings.tsx
'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export function PublishSettings() {
  const [settings, setSettings] = useState({
    isPublished: false,
    visibility: 'public',
    matureContent: false,
    allowComments: true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label>Yayın Durumu</Label>
          <p className="text-sm text-muted-foreground">
            {settings.isPublished ? 'Herkese açık' : 'Taslak'}
          </p>
        </div>
        <Switch
          checked={settings.isPublished}
          onCheckedChange={(val) => setSettings({...settings, isPublished: val})}
        />
      </div>

      <div className="space-y-2">
        <Label>Görünürlük</Label>
        <Select
          value={settings.visibility}
          onValueChange={(val) => setSettings({...settings, visibility: val})}
        >
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

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label>+18 İçerik</Label>
          <p className="text-sm text-muted-foreground">
            Yetişkinlere yönelik içerik
          </p>
        </div>
        <Switch
          checked={settings.matureContent}
          onCheckedChange={(val) => setSettings({...settings, matureContent: val})}
        />
      </div>
    </div>
  )
}