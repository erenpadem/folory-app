// components/reading-settings.tsx
'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

export function ReadingSettings({
  fontSize,
  lineHeight,
  onFontSizeChange,
  onLineHeightChange,
}: {
  fontSize: number
  lineHeight: number
  onFontSizeChange: (value: number) => void
  onLineHeightChange: (value: number) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Yazı Boyutu: {fontSize}px</Label>
        <Slider
          value={[fontSize]}
          max={24}
          min={12}
          step={1}
          onValueChange={(val) => onFontSizeChange(val[0])}
        />
      </div>
      <div>
        <Label>Satır Aralığı: {lineHeight.toFixed(1)}</Label>
        <Slider
          value={[lineHeight]}
          max={2.5}
          min={1.2}
          step={0.1}
          onValueChange={(val) => onLineHeightChange(val[0])}
        />
      </div>
    </div>
  )
}