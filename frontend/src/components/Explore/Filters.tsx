'use client'
import {
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  BookOpen,
  Clock,
  ListFilter,
  Star,
  Flame
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Filters, StatusOption } from "@/types/filters"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { debounce } from "@/hooks/use-debounce"

type FilterPanelProps = {
  onApplyFilters: (filters: Filters) => void
  initialFilters?: Partial<Filters>
}

export function FilterPanel({ onApplyFilters, initialFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const status = searchParams.get('status') || ''
    const sort = searchParams.get('sort') || 'popular'
    const minChapters = Number(searchParams.get('minChapters') || 0)
    const maxChapters = Number(searchParams.get('maxChapters') || 20)
    const minLikes = Number(searchParams.get('minLikes') || 0)
    const maxLikes = Number(searchParams.get('maxLikes') || 5000)
    const completedOnly = searchParams.get('completedOnly') === 'true'
    const recentlyUpdated = searchParams.get('recentlyUpdated') === 'true'
  
    setFilters({
      status,
      sort,
      minChapters,
      maxChapters,
      minLikes,
      maxLikes,
      completedOnly,
      recentlyUpdated
    })
  }, [searchParams])

  const [filters, setFilters] = useState({
    status: '',
    sort: 'popular',
    minChapters: 0,
    maxChapters: 20,
    minLikes: 0,
    maxLikes: 5000,
    completedOnly: false,
    recentlyUpdated: false
  })

  const statusOptions = [
    { value: 'published', label: 'Yayında' },
    { value: 'draft', label: 'Taslak' }
  ]

  const updateURL = useCallback((filters: Filters) => {
    const params = new URLSearchParams()
  
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'popular' && value !== false && value !== 0) {
        params.set(key, String(value))
      }
    })
  
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname, { scroll: false })
  }, [router])

  const debouncedUpdateURL = useMemo(
    () => debounce(updateURL, 300),
    [updateURL]
  )

  useEffect(() => {
    if (!isOpen) { // Sadece panel kapalıyken güncelle
      debouncedUpdateURL(filters)
    }
  }, [filters, isOpen, debouncedUpdateURL])


  const applyFilters = () => {
    onApplyFilters(filters)
    setIsOpen(false)
    updateURL(filters) // Immediate update when applying
  }

  const resetFilters = () => {
    const defaultFilters = {
      status: '',
      sort: 'popular',
      minChapters: 0,
      maxChapters: 20,
      minLikes: 0,
      maxLikes: 5000,
      completedOnly: false,
      recentlyUpdated: false
    }
    setFilters(defaultFilters)
    onApplyFilters(defaultFilters)
    updateURL(defaultFilters) // Immediate update when resetting
  }



  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ListFilter className="h-4 w-4" />
          Filtrele
          {Object.entries(filters).some(([key, value]) => {
            // Sadece önemli filtreler için gösterge
            return value && (key !== 'sort' || value !== 'popular')
          }) && (
            <span className="h-2 w-2 rounded-full bg-primary ml-1" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[360px] p-4 sm:w-full sm:max-w-[100vw] sm:h-[100vh]"
        onInteractOutside={(e) => {
          if (window.innerWidth < 640) e.preventDefault()
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Detaylı Filtreleme</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Durum Filtresi */}
          <div>
            <label className="block text-sm font-medium mb-2">Yayın Durumu</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {filters.status
                    ? statusOptions.find((opt) => opt.value === filters.status)?.label
                    : "Tümü"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Durum ara..." />
                  <CommandEmpty>Sonuç bulunamadı</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => setFilters({ ...filters, status: '' })}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${filters.status === '' ? 'opacity-100' : 'opacity-0'
                          }`}
                      />
                      Tümü
                    </CommandItem>
                    {statusOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => setFilters({ ...filters, status: option.value })}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${filters.status === option.value ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sıralama */}
          <div>
            <label className="block text-sm font-medium mb-2">Sırala</label>
            <Select
              value={filters.sort}
              onValueChange={(value) => setFilters({ ...filters, sort: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>Popüler</span>
                  </div>
                </SelectItem>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>En Yeni</span>
                  </div>
                </SelectItem>
                <SelectItem value="top-rated">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>En Beğenilen</span>
                  </div>
                </SelectItem>
                <SelectItem value="longest">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>En Uzun</span>
                  </div>
                </SelectItem>
                <SelectItem value="shortest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>En Kısa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Bölüm Sayısı */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium">Bölüm Sayısı</label>
              <span className="text-sm text-muted-foreground">
                {filters.minChapters}-{filters.maxChapters}
              </span>
            </div>
            <Slider
              value={[filters.minChapters, filters.maxChapters]}
              max={50}
              step={1}
              onValueChange={(value) => setFilters({
                ...filters,
                minChapters: value[0],
                maxChapters: value[1]
              })}
            />
          </div>

          {/* Beğeni Sayısı */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium">Beğeni Sayısı</label>
              <span className="text-sm text-muted-foreground">
                {filters.minLikes}-{filters.maxLikes}
              </span>
            </div>
            <Slider
              value={[filters.minLikes, filters.maxLikes]}
              max={10000}
              step={100}
              onValueChange={(value) => setFilters({
                ...filters,
                minLikes: value[0],
                maxLikes: value[1]
              })}
            />
          </div>

          <Separator />

          {/* Diğer Filtreler */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="completed" className="text-sm font-medium leading-none">
                Sadece Tamamlanmış Hikayeler
              </label>
              <Switch
                id="completed"
                checked={filters.completedOnly}
                onCheckedChange={(checked) => setFilters({ ...filters, completedOnly: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="recent" className="text-sm font-medium leading-none">
                Son Güncellenenler
              </label>
              <Switch
                id="recent"
                checked={filters.recentlyUpdated}
                onCheckedChange={(checked) => setFilters({ ...filters, recentlyUpdated: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Butonlar */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetFilters}
            >
              Sıfırla
            </Button>
            <Button
              className="flex-1"
              onClick={applyFilters}
            >
              Uygula
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}