'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, MessageSquare, BookOpen, Check, Trash2, CheckCheck } from 'lucide-react'
import api from '@/shared/lib/api-client'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Notification {
  id: number
  type: string
  data: {
    replier_name?: string
    book_title?: string
    author_name?: string
    book_id?: number
    comment_id?: number
    reply_id?: number
  }
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const params = filter === 'unread' ? { unread_only: true } : {}
      const response = await api.get('/api/notifications', { params })
      return response.data
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/notifications/${id}/read`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Bildirim okundu olarak işaretlendi')
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/notifications/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Tüm bildirimler okundu olarak işaretlendi')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Bildirim silindi')
    },
  })

  const notifications: Notification[] = data?.data || []
  const unreadCount = data?.meta?.unread_count || 0

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_reply':
        return <MessageSquare className="h-5 w-5" />
      case 'new_book':
        return <BookOpen className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationTitle = (notification: Notification) => {
    switch (notification.type) {
      case 'comment_reply':
        return `${notification.data.replier_name} yorumunuza cevap verdi`
      case 'new_book':
        return `${notification.data.author_name} yeni bir kitap yayınladı`
      default:
        return 'Yeni bildirim'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    // For now, use book_id. In the future, we can fetch book slug from API
    switch (notification.type) {
      case 'comment_reply':
        return `/book/${notification.data.book_id}`
      case 'new_book':
        return `/book/${notification.data.book_id}`
      default:
        return '/'
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bildirimler</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 && `${unreadCount} okunmamış bildirim`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Sadece Okunmamışlar' : 'Tümü'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read_at ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    !notification.read_at ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={getNotificationLink(notification)}
                          className="block"
                        >
                          <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                            {getNotificationTitle(notification)}
                          </h3>
                          {notification.data.book_title && (
                            <p className="text-sm text-muted-foreground">
                              {notification.data.book_title}
                            </p>
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read_at && (
                          <Badge variant="secondary" className="text-xs">
                            Yeni
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending || !!notification.read_at}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(notification.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

