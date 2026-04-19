// components/reading-settings.tsx
'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ScreenFilter = 'none' | 'blue-light' | 'night' | 'sepia'

export function ReadingSettings({
  fontSize,
  lineHeight,
  screenFilter,
  onFontSizeChange,
  onLineHeightChange,
  onScreenFilterChange,
}: {
  fontSize: number
  lineHeight: number
  screenFilter?: ScreenFilter
  onFontSizeChange: (value: number) => void
  onLineHeightChange: (value: number) => void
  onScreenFilterChange?: (filter: ScreenFilter) => void
}) {
  const filters: { value: ScreenFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'none', label: 'Yok', icon: <EyeOff className="h-4 w-4" /> },
    { value: 'blue-light', label: 'Mavi Işık Filtresi', icon: <Sun className="h-4 w-4" /> },
    { value: 'night', label: 'Gece Modu', icon: <Moon className="h-4 w-4" /> },
    { value: 'sepia', label: 'Sepya', icon: <Eye className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
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
      {onScreenFilterChange && (
        <div>
          <Label>Ekran Filtresi</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={screenFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onScreenFilterChange(filter.value)}
                className="justify-start"
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}