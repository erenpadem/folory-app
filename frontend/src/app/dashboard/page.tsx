'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
} from '@/components/ui/app-tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookCard } from '@/components/book/BookCard'
import { CommentItem } from '@/components/book/CommentItem'
import { Button } from '@/components/ui/button'
import { Star, BookOpen, MessageSquare, Eye, Plus } from 'lucide-react'
import api from '@/shared/lib/api-client'
import { unwrapResourceCollection } from '@/shared/lib/unwrap-resource-collection'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const deleteBook = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/books/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-books'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['user-book-comments'] })
      queryClient.invalidateQueries({ queryKey: ['user-book-ratings'] })
    },
  })

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard/stats')
      return response.data
    },
  })

  // Fetch user books
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['user-books'],
    queryFn: async () => {
      const response = await api.get('/api/books/me')
      return response.data
    },
  })

  // Fetch comments on user's books
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['user-book-comments'],
    queryFn: async () => {
      // Get all user books first
      const booksResponse = await api.get('/api/books/me')
      const books = unwrapResourceCollection(booksResponse.data?.data ?? booksResponse.data)
      
      // Fetch comments for each book
      const commentsPromises = books.map(async (book: any) => {
        try {
          const commentsResponse = await api.get(`/api/comments/book/${book.id}`)
          const comments = unwrapResourceCollection(commentsResponse.data?.data ?? commentsResponse.data)
          return {
            book,
            comments,
          }
        } catch (error) {
          return { book, comments: [] }
        }
      })
      
      const results = await Promise.all(commentsPromises)
      return results.filter((r: any) => r.comments.length > 0)
    },
  })

  // Fetch ratings on user's books
  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['user-book-ratings'],
    queryFn: async () => {
      const booksResponse = await api.get('/api/books/me')
      const books = unwrapResourceCollection(booksResponse.data?.data ?? booksResponse.data)
      
      const ratingsPromises = books.map(async (book: any) => {
        try {
          const ratingsResponse = await api.get(`/api/ratings/book/${book.id}`)
          const payload = ratingsResponse.data
          const ratings = unwrapResourceCollection(payload?.data ?? payload)
          const averageRating =
            payload?.average_rating != null && Number.isFinite(Number(payload.average_rating))
              ? Number(payload.average_rating)
              : 0
          const ratingCount =
            payload?.meta?.total != null && Number.isFinite(Number(payload.meta.total))
              ? Number(payload.meta.total)
              : ratings.length

          return {
            book,
            ratings,
            averageRating,
            ratingCount,
          }
        } catch (error) {
          return { book, ratings: [], averageRating: 0, ratingCount: 0 }
        }
      })
      
      const results = await Promise.all(ratingsPromises)
      return results.filter((item) => item.ratingCount > 0 || item.averageRating > 0)
    },
  })

  const books = unwrapResourceCollection(booksData?.data ?? booksData)
  const comments = commentsData || []
  const ratings = ratingsData || []
  
  // Use stats from API if available, otherwise calculate from local data
  const stats = statsData?.data?.stats ? {
    totalBooks: statsData.data.stats.total_books,
    publishedBooks: statsData.data.stats.published_books,
    draftBooks: statsData.data.stats.draft_books,
    totalViews: statsData.data.stats.total_views,
    totalComments: statsData.data.stats.total_comments,
    totalRatings: statsData.data.stats.total_ratings ?? 0,
    averageRating: statsData.data.stats.average_rating ?? 0
  } : {
    totalBooks: books.length,
    publishedBooks: books.filter((b: any) => b.is_published).length,
    draftBooks: books.filter((b: any) => b.is_draft && !b.is_published).length,
    totalViews: books.reduce((sum: number, b: any) => sum + (b.read_count || 0), 0),
    totalComments: comments.reduce((sum: number, c: any) => sum + c.comments.length, 0),
    totalRatings: ratings.reduce((sum: number, r: any) => sum + (r.ratingCount || 0), 0),
    averageRating: ratings.length > 0 
      ? ratings.reduce((sum: number, r: any) => sum + r.averageRating, 0) / ratings.length 
      : 0
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel</h1>
          <p className="text-muted-foreground">Kitaplarınızın genel durumu ve istatistikleri</p>
        </div>
        {!booksLoading && books.length > 0 && (
          <Button asChild className="shrink-0 self-start sm:self-center">
            <Link href="/dashboard/books/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kitap
            </Link>
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kitap</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBooks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.publishedBooks} yayında, {stats.draftBooks} taslak
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tüm kitaplarınız</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComments}</div>
                <p className="text-xs text-muted-foreground">Yanıt bekleyen yorumlar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalRatings > 0
                    ? `${stats.totalRatings} değerlendirme`
                    : 'Tüm kitaplarınız'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Tabs */}
      <AppTabs defaultValue="books" className="w-full">
        <AppTabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <AppTabsTrigger value="books">Kitaplarım</AppTabsTrigger>
          <AppTabsTrigger value="comments">
            Yorumlar ({stats.totalComments})
          </AppTabsTrigger>
          <AppTabsTrigger value="ratings">Puanlar</AppTabsTrigger>
          <AppTabsTrigger value="stats">İstatistikler</AppTabsTrigger>
        </AppTabsList>

        <AppTabsContent value="books">
          {booksLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Henüz kitap oluşturmadınız.</p>
              <Button asChild>
                <Link href="/dashboard/books/new">Yeni Kitap Oluştur</Link>
              </Button>
            </Card>
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
        </AppTabsContent>

        <AppTabsContent value="comments">
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Henüz yorum yapılmamış.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {comments.map((item: any) => (
                <Card key={item.book.id} className="p-6">
                  <div className="mb-4 pb-4 border-b">
                    <Link href={`/book/${item.book.slug || item.book.id}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                        {item.book.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {item.comments.map((comment: any) => (
                      <CommentItem
                        key={comment.id}
                        comment={{
                          id: comment.id,
                          content: comment.content,
                          user: comment.user
                            ? {
                                id: comment.user.id,
                                name: comment.user.name,
                                username: comment.user.username,
                                avatar: comment.user.avatar,
                              }
                            : undefined,
                          likes_count: comment.likes_count ?? 0,
                          is_liked: comment.is_liked,
                          created_at: comment.created_at,
                          replies: comment.replies ?? [],
                        }}
                        bookId={item.book.id}
                        depth={0}
                        onReplyPosted={() => void refetchComments()}
                        onLikeUpdated={() => void refetchComments()}
                      />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </AppTabsContent>

        <AppTabsContent value="ratings">
          {ratingsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Henüz puan verilmemiş.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {ratings.map((item: any) => (
                <Card key={item.book.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link href={`/book/${item.book.slug || item.book.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                          {item.book.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({item.ratingCount} değerlendirme)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {item.ratings.slice(0, 5).map((rating: any) => (
                      <div key={rating.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.score
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {rating.user?.name || 'Anonim'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    ))}
                    {item.ratings.length > 5 && (
                      <Link href={`/book/${item.book.slug || item.book.id}`}>
                        <Button variant="link" className="w-full">
                          Tümünü Gör ({item.ratingCount} değerlendirme)
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </AppTabsContent>

        <AppTabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kitap Durumları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Yayında</span>
                    <Badge variant="default">{stats.publishedBooks}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taslak</span>
                    <Badge variant="outline">{stats.draftBooks}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genel İstatistikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Toplam Görüntülenme</span>
                    <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toplam Yorum</span>
                    <span className="font-medium">{stats.totalComments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Toplam Değerlendirme</span>
                    <span className="font-medium">{stats.totalRatings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ortalama Puan</span>
                    <span className="font-medium">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AppTabsContent>
      </AppTabs>
    </div>
  )
}

