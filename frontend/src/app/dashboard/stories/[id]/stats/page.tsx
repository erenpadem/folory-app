// app/dashboard/stories/[id]/stats/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

type StatsData = {
  totalReads: number
  totalLikes: number
  totalComments: number
  readsByDay: { date: string; count: number }[]
  likesByDay: { date: string; count: number }[]
  popularChapters: { title: string; reads: number }[]
}

export default function StoryStatsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/stories/${id}/stats`)
        const data = await response.json()
        
        if (response.ok) {
          setStats(data)
        } else {
          throw new Error(data.message || 'İstatistikler yüklenirken hata oluştu')
        }
      } catch (error) {
        console.error('Stats error:', error)
        router.push(`/dashboard/stories/${id}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [id, router])

  if (isLoading || !stats) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icons.spinner className="mx-auto h-8 w-8 animate-spin" />
          <p>İstatistikler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hikaye İstatistikleri</h1>
          <div className="flex gap-4 mt-2">
            <Link 
              href={`/dashboard/stories/${id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Hikayeye geri dön
            </Link>
            <Link 
              href={`/dashboard/stories/${id}/edit`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Düzenle →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Icons.download className="mr-2 h-4 w-4" />
            Rapor Al
          </Button>
          <Button variant="outline">
            <Icons.share className="mr-2 h-4 w-4" />
            Paylaş
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Toplam Okunma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReads}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Beğeni Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Yorum Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Günlük Okunma Grafiği</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.readsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Günlük Beğeni Grafiği</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.likesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">En Popüler Bölümler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularChapters.map((chapter, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-muted-foreground">#{index + 1}</span>
                  <span>{chapter.title}</span>
                </div>
                <span className="font-medium">{chapter.reads} okunma</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}