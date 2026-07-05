'use client';
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/book/EmptyState'
import { BookCard } from '@/components/book/BookCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import api from '@/shared/lib/api-client'
import { unwrapResourceCollection } from '@/shared/lib/unwrap-resource-collection'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { clearBookEditorIfDeleted } from '@/features/books/presentation/utils/book-editor-storage'

type BookStatus = 'all' | 'draft' | 'published'

function buildListParams(statusFilter: BookStatus, debouncedSearch: string, sortBy: 'newest' | 'oldest' | 'title' | 'rating') {
  const params: Record<string, string | number | boolean> = {
    per_page: 100,
  }

  if (statusFilter === 'draft') {
    params.is_draft = true
    params.is_published = false
  } else if (statusFilter === 'published') {
    params.is_published = true
  }

  const q = debouncedSearch.trim()
  if (q) {
    params.search = q
  }

  switch (sortBy) {
    case 'newest':
      params.sort_by = 'created_at'
      params.sort_order = 'desc'
      break
    case 'oldest':
      params.sort_by = 'created_at'
      params.sort_order = 'asc'
      break
    case 'title':
      params.sort_by = 'title'
      params.sort_order = 'asc'
      break
    case 'rating':
      params.sort_by = 'rating'
      params.sort_order = 'desc'
      break
  }

  return params
}

export default function BooksDashboard() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookStatus>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'rating'>('newest')

  const debouncedSearch = useDebounce(searchQuery, 300)

  const listParams = useMemo(
    () => buildListParams(statusFilter, debouncedSearch, sortBy),
    [statusFilter, debouncedSearch, sortBy]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['user-books', listParams],
    queryFn: async () => {
      const response = await api.get('/api/books/me', { params: listParams })
      return response.data
    },
  })

  const deleteBook = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/books/${id}`)
    },
    onSuccess: (_data, deletedId) => {
      clearBookEditorIfDeleted(deletedId)
      queryClient.invalidateQueries({ queryKey: ['user-books'] })
    },
  })

  const books = unwrapResourceCollection(data?.data ?? data)
  const counts = data?.meta?.counts as { all?: number; published?: number; draft?: number } | undefined

  const totalAll = counts?.all ?? books.length
  const publishedCount = counts?.published ?? books.filter((b: { is_published?: boolean }) => b.is_published).length
  const draftCount = counts?.draft ?? books.filter((b: { is_draft?: boolean; is_published?: boolean }) => b.is_draft && !b.is_published).length

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kitaplarım</h1>
          <p className="text-muted-foreground mt-1">
            {totalAll} kitap • {publishedCount} yayında • {draftCount} taslak
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/books/new">Yeni Kitap</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kitap adına göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrele:</span>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookStatus)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü ({totalAll})</SelectItem>
              <SelectItem value="published">Yayında ({publishedCount})</SelectItem>
              <SelectItem value="draft">Taslak ({draftCount})</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title' | 'rating') => setSortBy(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="title">İsme Göre</SelectItem>
              <SelectItem value="rating">Puana Göre</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || debouncedSearch.trim()) && (
            <div className="flex items-center gap-2 flex-wrap">
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {statusFilter === 'published' ? 'Yayında' : 'Taslak'}
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {debouncedSearch.trim() && (
                <Badge variant="secondary" className="gap-1">
                  Arama: {debouncedSearch.trim()}
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : books.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: any) => {
              const slug = book.slug || book.id
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  dashboardActions={{
                    viewHref: book.is_published
                      ? `/book/${slug}`
                      : `/dashboard/books/update/${slug}`,
                    editHref: `/dashboard/books/update/${slug}`,
                    onDelete: () => deleteBook.mutateAsync(book.id),
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
