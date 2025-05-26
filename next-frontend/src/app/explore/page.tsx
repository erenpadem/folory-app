'use client'
import { useRef, useCallback, useState, useEffect } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Search, Star, Flame, Clock, ListFilter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'
import { Filters } from '@/types/filters'
import { FilterPanel } from '@/components/Explore/Filters'
import { Story } from '@/types/story'
import { debounce } from '@/hooks/use-debounce'

const fetcher = (url: string) => fetch(url).then(res => res.json())
const PAGE_SIZE = 8

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [sortBy, setSortBy] = useState('popular')

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const getKey = (pageIndex: number, previousPageData: Story[]) => {
    if (previousPageData && !previousPageData.length) return null

    const params = new URLSearchParams()
    params.set('page', String(pageIndex + 1))
    params.set('limit', String(PAGE_SIZE))

    // Tüm filtreleri ekle
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value))
    })

    if (searchQuery) params.set('search', searchQuery)

    return `/api/stories?${params.toString()}`
  }

  const genres = [
    "Fantastik", "Romantik", "Bilim Kurgu", "Gerilim",
    "Korku", "Dram", "Macera", "Genç Yetişkin"
  ]

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre)
    setSize(1) // Reset pagination when filter changes
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setSize(1) // Reset pagination when sort changes
  }

  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<Partial<Filters>>({
    status: searchParams.get('status') || '',
    sort: searchParams.get('sort') || 'popular',
    minChapters: Number(searchParams.get('minChapters')) || 0,
    maxChapters: Number(searchParams.get('maxChapters')) || 20,
    minLikes: Number(searchParams.get('minLikes')) || 0,
    maxLikes: Number(searchParams.get('maxLikes')) || 5000,
    completedOnly: searchParams.get('completedOnly') === 'true',
    recentlyUpdated: searchParams.get('recentlyUpdated') === 'true'
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newFilters: Partial<Filters> = {}

    params.forEach((value, key) => {
      if (key === 'minChapters' || key === 'maxChapters' || key === 'minLikes' || key === 'maxLikes') {
        newFilters[key] = Number(value)
      } else if (key === 'completedOnly' || key === 'recentlyUpdated') {
        newFilters[key] = value === 'true'
      } else {
        newFilters[key as keyof Filters] = value
      }
    })

    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [searchParams])

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher)
  const stories: Story[] = data ? [].concat(...data) : []
  const isLoadingInitialData = !data && !stories.length
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE)

  // Search için debounce ekle
  const handleSearch = debounce((query: string) => {
    setSearchQuery(query)
    setSize(1) // Arama yapıldığında sayfalamayı sıfırla
  }, 500)

  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isValidating) {
      setSize(size + 1)
    }
  }, [size, setSize, isReachingEnd, isValidating])

  const lastStoryElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isValidating) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isReachingEnd) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isValidating, loadMore, isReachingEnd]
  )

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters)
    setSize(1) // Filtre değiştiğinde sayfalamayı sıfırla
  }


  return (
    <div className="container py-8">
      {/* Arama ve Filtreleme */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hikaye, yazar veya kategori ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {genres.map(genre => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleGenreSelect(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList>
              <TabsTrigger value="popular">
                <Flame className="h-4 w-4 mr-2" />
                Popüler
              </TabsTrigger>
              <TabsTrigger value="new">
                <Clock className="h-4 w-4 mr-2" />
                Yeni
              </TabsTrigger>
              <TabsTrigger value="top-rated">
                <Star className="h-4 w-4 mr-2" />
                En Beğenilen
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <FilterPanel onApplyFilters={handleApplyFilters} />
        </div>
      </div>

      {/* Hikaye Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoadingInitialData ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={`skeleton-${index}`}>
              <CardHeader className="p-0">
                <Skeleton className="aspect-[3/4] w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-16" />
              </CardFooter>
            </Card>
          ))
        ) : isEmpty ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Hiç hikaye bulunamadı</p>
          </div>
        ) : (
          stories?.map((story, index) => (
            <Card
              key={story?.id || index}
              className="hover:shadow-lg transition-shadow"
              ref={index === stories.length - 1 ? lastStoryElementRef : null}
            >
              <CardHeader className="p-0">
                <div className="aspect-[3/4] relative">
                  {story?.cover && (
                    <Image
                      src={story.cover}
                      alt={story?.title || 'Hikaye'}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg line-clamp-1">
                  {story?.title || 'Başlıksız Hikaye'}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {story?.author || 'Bilinmeyen Yazar'}
                </CardDescription>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {story?.description || 'Açıklama yok'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                  <span>{story?.likes ?? 0}</span>
                </div>
                <span>{story?.genre || 'Genresiz'}</span>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Yükleme durumu */}
      <div className="mt-8 flex justify-center" ref={loadingRef}>
        {isValidating && !isLoadingInitialData && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Daha fazla hikaye yükleniyor...</span>
          </div>
        )}
        {isReachingEnd && !isLoadingInitialData && stories?.length > 0 && (
          <p className="text-muted-foreground">Tüm hikayeler yüklendi</p>
        )}
      </div>
    </div>
  )
}