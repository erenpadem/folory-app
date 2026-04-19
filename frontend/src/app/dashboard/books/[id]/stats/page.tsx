// app/dashboard/books/[id]/stats/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
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
  popularSections: { title: string; reads: number }[]
}

export default function BookStatsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API endpoint when available
        // const response = await fetch(`/api/books/${id}/stats`)
        // const data = await response.json()
        
        // Mock data for now
        const mockStats: StatsData = {
          totalReads: 0,
          totalLikes: 0,
          totalComments: 0,
          readsByDay: [],
          likesByDay: [],
          popularSections: []
        }
        
        setStats(mockStats)
      } catch (error) {
        console.error('Stats error:', error)
        router.push(`/dashboard/books`)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchStats()
    }
  }, [id, router])

  if (isLoading || !stats) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p>İstatistikler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kitap İstatistikleri</h1>
          <div className="flex gap-4 mt-2">
            <Link 
              href={`/book/${id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Kitaba geri dön
            </Link>
            <Link 
              href={`/dashboard/books/update/${id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Düzenle →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            Rapor Al
          </Button>
          <Button variant="outline">
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

      {stats.readsByDay.length > 0 && (
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
      )}

      {stats.popularSections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">En Popüler Bölümler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularSections.map((section, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-muted-foreground">#{index + 1}</span>
                    <span>{section.title}</span>
                  </div>
                  <span className="font-medium">{section.reads} okunma</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalReads === 0 && stats.totalLikes === 0 && stats.totalComments === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Henüz istatistik verisi bulunmuyor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

