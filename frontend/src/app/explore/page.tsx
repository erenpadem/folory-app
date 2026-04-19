'use client'
import { useRef, useCallback, useState, useEffect } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Search, Star, Flame, Clock, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppTabs, AppTabsList, AppTabsTrigger } from '@/components/ui/app-tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'
import { Filters } from '@/types/filters'
import { FilterPanel } from '@/components/Explore/Filters'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { useMemo } from 'react'

interface Book {
  id: number
  slug?: string
  title: string
  cover?: string | null
  short_description?: string | null
  read_count?: number
  total_page?: number
  is_draft?: boolean
  is_published?: boolean
  average_rating?: number
  rating_count?: number
  category?: {
    id: number
    name: string
    slug: string
  } | null
  author?: {
    id: number
    name: string
    avatar?: string | null
  } | null
  created_at?: string
  updated_at?: string
}

interface Category {
  id: number
  name: string
  slug: string
}

interface BookListResponse {
  data: Book[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const fetcher = async (url: string): Promise<BookListResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const errorData = await res.json().catch(() => ({}));
    (error as Error & { info?: unknown; status?: number }).info = errorData;
    (error as Error & { info?: unknown; status?: number }).status = res.status;
    throw error;
  }
  return res.json();
};

const PAGE_SIZE = 8

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [sortBy, setSortBy] = useState('popular')

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

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

  // Fetch categories
  const { data: categoriesData } = useSWRInfinite(
    () => '/api/categories',
    async (url: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      const res = await fetch(`${apiUrl}${url}`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      return data.data || []
    },
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    }
  )

  const categories: Category[] = useMemo(() => categoriesData?.[0] || [], [categoriesData])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const newFilters: Partial<Filters> = {}

    params.forEach((value, key) => {
      if (key === 'minChapters' || key === 'maxChapters' || key === 'minLikes' || key === 'maxLikes') {
        newFilters[key] = Number(value)
      } else if (key === 'completedOnly' || key === 'recentlyUpdated') {
        newFilters[key] = value === 'true'
      } else if (key === 'status' || key === 'sort') {
        newFilters[key] = value
      }
    })

    setFilters(prev => ({ ...prev, ...newFilters }))
    
    // Set category from URL
    const categoryParam = params.get('category')
    if (categoryParam && categories.length > 0) {
      const category = categories.find(c => c.slug === categoryParam || String(c.id) === categoryParam)
      if (category) {
        setSelectedCategoryId(String(category.id))
      }
    }
  }, [searchParams, categories])

  const getKey = useCallback((pageIndex: number, previousPageData: BookListResponse | null) => {
    if (previousPageData && (!previousPageData.data || previousPageData.data.length === 0)) return null;
  
    const params = new URLSearchParams();
    params.set('page', String(pageIndex + 1));
    params.set('per_page', String(PAGE_SIZE));
  
    // Map frontend filters to backend expectations
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    if (selectedCategoryId) {
      params.set('category_id', selectedCategoryId);
    }
    
    // Status filter - map to is_published
    // Default is already published books, so we don't need to set it
    if (filters.status === 'draft') {
      params.set('is_published', 'false');
    } else if (filters.status === 'published') {
      params.set('is_published', 'true');
    }
  
    // Apply filters
    if (filters.minChapters && filters.minChapters > 0) {
      params.set('minChapters', String(filters.minChapters));
    }
    if (filters.maxChapters && filters.maxChapters > 0) {
      params.set('maxChapters', String(filters.maxChapters));
    }
    if (filters.minLikes && filters.minLikes > 0) {
      params.set('minLikes', String(filters.minLikes));
    }
    if (filters.maxLikes && filters.maxLikes > 0) {
      params.set('maxLikes', String(filters.maxLikes));
    }
    if (filters.completedOnly) {
      params.set('completedOnly', 'true');
    }
    if (filters.recentlyUpdated) {
      params.set('recentlyUpdated', 'true');
    }
  
    // Sorting
    if (filters.sort) {
      params.set('sort_by', filters.sort);
      params.set('sort_order', filters.sort === 'shortest' ? 'asc' : 'desc');
    } else if (sortBy === 'popular') {
      params.set('sort_by', 'read_count');
      params.set('sort_order', 'desc');
    } else if (sortBy === 'new') {
      params.set('sort_by', 'created_at');
      params.set('sort_order', 'desc');
    } else if (sortBy === 'top-rated') {
      params.set('sort_by', 'read_count');
      params.set('sort_order', 'desc');
    }
  
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    return `${apiUrl}/api/books?${params.toString()}`;
  }, [searchQuery, selectedCategoryId, sortBy, filters.status, filters.minChapters, filters.maxChapters, filters.minLikes, filters.maxLikes, filters.completedOnly, filters.recentlyUpdated, filters.sort]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId === selectedCategoryId ? '' : categoryId)
    setSize(1) // Reset pagination when filter changes
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setFilters(prev => ({ ...prev, sort: value }))
    setSize(1) // Reset pagination when sort changes
  }

  const { data, size, setSize, isValidating, error } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
  })
  
  const books: Book[] = data ? data.flatMap(page => page.data || []) : []
  const isLoadingInitialData = !data && !error
  const isEmpty = data?.[0]?.data?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data && data[data.length - 1].data.length < PAGE_SIZE)

  // Search için debounce ekle
  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      setSearchQuery(query)
      setSize(1) // Arama yapıldığında sayfalamayı sıfırla
    },
    500
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query) // Immediate update for UI
    debouncedSearch(query) // Debounced update for API
  }

  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isValidating) {
      setSize(size + 1)
    }
  }, [size, setSize, isReachingEnd, isValidating])

  const lastBookElementRef = useCallback(
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
            placeholder="Kitap, yazar veya kategori ara..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Kategoriler */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={!selectedCategoryId ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => handleCategorySelect('')}
            >
              Tümü
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategoryId === String(category.id) ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleCategorySelect(String(category.id))}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <AppTabs value={sortBy} onValueChange={handleSortChange}>
            <AppTabsList className="inline-flex w-full min-w-0 flex-wrap sm:w-auto sm:flex-nowrap">
              <AppTabsTrigger value="popular">
                <Flame className="mr-2 h-4 w-4" />
                Popüler
              </AppTabsTrigger>
              <AppTabsTrigger value="new">
                <Clock className="mr-2 h-4 w-4" />
                Yeni
              </AppTabsTrigger>
              <AppTabsTrigger value="top-rated">
                <Star className="mr-2 h-4 w-4" />
                En Beğenilen
              </AppTabsTrigger>
            </AppTabsList>
          </AppTabs>
          <FilterPanel 
            onApplyFilters={(newFilters) => {
              setFilters(newFilters)
              setSize(1)
            }} 
            initialFilters={filters}
          />
        </div>
      </div>

      {/* Hata durumu */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Kitaplar yüklenirken bir hata oluştu</p>
          <Button onClick={() => setSize(1)}>Tekrar Dene</Button>
        </div>
      )}

      {/* Kitap Listesi */}
      {!error && (
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
              <p className="text-muted-foreground text-lg mb-2">Hiç kitap bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'Filtreleri temizleyip tekrar deneyin'}
              </p>
            </div>
          ) : (
            books?.map((book, index) => (
              <Card
                key={book?.id || index}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                ref={index === books.length - 1 ? lastBookElementRef : null}
              >
                <Link href={`/book/${book.slug || book.id}`} className="block">
                  <CardHeader className="p-0">
                    <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-muted">
                      {book?.cover ? (
                        <Image
                          src={book.cover}
                          alt={book?.title || 'Kitap'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Kapak Yok</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <CardTitle className="text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {book?.title || 'Başlıksız Kitap'}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 mb-2">
                      {book?.author?.name || 'Bilinmeyen Yazar'}
                    </CardDescription>
                    {book?.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {book.short_description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center text-sm pt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{book?.read_count ?? 0}</span>
                      </div>
                      {book?.average_rating && book.average_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{book.average_rating.toFixed(1)}</span>
                          {book.rating_count && (
                            <span className="text-xs text-muted-foreground">({book.rating_count})</span>
                          )}
                        </div>
                      )}
                    </div>
                    {book?.category && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {book.category.name}
                      </span>
                    )}
                  </CardFooter>
                </Link>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Yükleme durumu */}
      <div className="mt-8 flex justify-center" ref={loadingRef}>
        {isValidating && !isLoadingInitialData && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Daha fazla kitap yükleniyor...</span>
          </div>
        )}
        {isReachingEnd && !isLoadingInitialData && books?.length > 0 && (
          <p className="text-muted-foreground">Tüm kitaplar yüklendi</p>
        )}
      </div>
    </div>
  )
}
