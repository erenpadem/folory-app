// app/dashboard/stories/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'
import { ChapterEditor } from '@/components/story-editor/ChapterEditor'
import { ChapterList } from '@/components/story-editor/ChapterList'
import { PreviewDialog } from '@/components/story-editor/PreviewDialog'
import { StorySettings } from '@/components/story-editor/StorySettings'
import { StorySidebar } from '@/components/story-editor/StorySidebar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CoverImageUploader } from '@/components/story-editor/CoverImageUploader'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

type Chapter = {
  id: string
  title: string
  content: string
  wordCount: number
  status: 'draft' | 'published'
  createdAt: string
}

type StoryInfo = {
  title: string
  description: string
  coverImage: string | null
  tags: string[]
  category: string
  status: 'draft' | 'published'
}

export default function StoryEditPage() {
  const router = useRouter()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('editor')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [storyInfo, setStoryInfo] = useState<StoryInfo>({
    title: '',
    description: '',
    coverImage: null,
    tags: [],
    category: '',
    status: 'draft'
  })
  const [isLoading, setIsLoading] = useState(true)

  const activeChapter = chapters.find(ch => ch.id === activeChapterId)

  // Hikaye verilerini yükle
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/stories/${id}`)
        const data = await response.json()

        if (response.ok) {
          setStoryInfo({
            title: data.title,
            description: data.description,
            coverImage: data.coverImage,
            tags: data.tags || [],
            category: data.category || '',
            status: data.status
          })
          setChapters(data.chapters || [])
          if (data.chapters?.length > 0) {
            setActiveChapterId(data.chapters[0].id)
          }
        } else {
          throw new Error(data.message || 'Hikaye yüklenirken hata oluştu')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu')
        router.push('/dashboard/stories')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStoryData()
  }, [id, router])

  const updateStoryInfo = (updates: Partial<StoryInfo>) => {
    setStoryInfo(prev => ({ ...prev, ...updates }))
  }

  const handleCoverImageChange = (image: string | null) => {
    updateStoryInfo({ coverImage: image })
  }

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: `Bölüm ${chapters.length + 1}`,
      content: '',
      wordCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
    setChapters([...chapters, newChapter])
    setActiveChapterId(newChapter.id)
  }

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters(chapters.map(ch =>
      ch.id === id ? { ...ch, ...updates } : ch
    ))
  }

  const handleSave = async (publish: boolean) => {
    const saveToast = toast.loading(publish ? 'Yayınlanıyor...' : 'Kaydediliyor...')

    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storyInfo,
          chapters,
          status: publish ? 'published' : 'draft'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt sırasında hata oluştu')
      }

      toast.success(publish ? 'Hikaye yayınlandı!' : 'Değişiklikler kaydedildi!', {
        id: saveToast
      })

      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu', {
        id: saveToast
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icons.spinner className="h-5 w-5 animate-spin" />
          <p>Hikaye yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#000',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          }
        }}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hikaye Düzenle</h1>
          <div className="flex gap-4 mt-2">
            <Link
              href={`/dashboard/stories/${id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Hikayeye geri dön
            </Link>
            <Link
              href={`/dashboard/stories/${id}/stats`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              İstatistikleri görüntüle →
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            disabled={!activeChapter}
          >
            <Icons.eye className="mr-2 h-4 w-4" />
            Önizleme
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={!storyInfo.title || chapters.length === 0}
          >
            <Icons.save className="mr-2 h-4 w-4" />
            Kaydet
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={!storyInfo.title || chapters.length === 0}
          >
            <Icons.upload className="mr-2 h-4 w-4" />
            Yayınla
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="story-title">Hikaye Başlığı</Label>
          <Input
            id="story-title"
            value={storyInfo.title}
            onChange={(e) => updateStoryInfo({ title: e.target.value })}
            className="text-lg font-medium"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="story-description">Açıklama</Label>
          <Textarea
            id="story-description"
            value={storyInfo.description}
            onChange={(e) => updateStoryInfo({ description: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {activeChapter && (
        <div className="flex items-center gap-4 mb-6">
          <Badge variant={activeChapter.status === 'published' ? 'default' : 'secondary'}>
            {activeChapter.status === 'published' ? 'Yayında' : 'Taslak'}
          </Badge>
          <h2 className="text-xl font-semibold">{activeChapter.title}</h2>
          <span className="text-sm text-muted-foreground">
            {activeChapter.wordCount} kelime
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="editor">Editör</TabsTrigger>
              <TabsTrigger value="chapters">Bölümler ({chapters.length})</TabsTrigger>
              <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-6">
              {activeChapter ? (
                <ChapterEditor
                  key={activeChapter.id}
                  chapter={activeChapter}
                  onUpdate={(content) => updateChapter(activeChapter.id, {
                    content,
                    wordCount: content.split(/\s+/).filter(Boolean).length
                  })}
                />
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground mb-4">Düzenlenecek bölüm bulunamadı</p>
                  <Button onClick={addChapter}>
                    Yeni Bölüm Ekle
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chapters" className="mt-6">
              <ChapterList
                chapters={chapters}
                activeChapterId={activeChapterId}
                onSelectChapter={setActiveChapterId}
                onAddChapter={addChapter}
                onUpdateChapter={updateChapter}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <StorySettings
                storyInfo={storyInfo}
                onUpdate={updateStoryInfo}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <CoverImageUploader
            image={storyInfo.coverImage}
            onImageChange={handleCoverImageChange}
          />
          <StorySidebar
            storyInfo={storyInfo}
            chapters={chapters}
            onSaveDraft={() => handleSave(false)}
            onPublish={() => handleSave(true)}
            onUpdateStory={updateStoryInfo}
          />
        </div>
      </div>

      <PreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        chapter={activeChapter || null}
        chapters={chapters}
        storyInfo={storyInfo}
      />
    </div>
  )
}