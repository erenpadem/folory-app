// app/dashboard/stories/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

type Chapter = {
  id: string
  title: string
  content: string
  wordCount: number
  status: 'draft' | 'published'
}

type StoryInfo = {
  title: string
  description: string
  coverImage: string | null
  tags?: string[]
  category?: string
}

export default function StoryEditorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('editor')
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [storyInfo, setStoryInfo] = useState<StoryInfo>({
    title: '',
    description: '',
    coverImage: null
  })

  const activeChapter = chapters.find(ch => ch.id === activeChapterId)

  // Hikaye bilgilerini güncelleme
  const updateStoryInfo = (updates: Partial<StoryInfo>) => {
    setStoryInfo(prev => ({ ...prev, ...updates }))
  }
  // Kapak resmini güncelleme
  const handleCoverImageChange = (image: string | null) => {
    updateStoryInfo({ coverImage: image })
  }
  // Yeni bölüm ekleme
  const addChapter = () => {
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: `Bölüm ${chapters.length + 1}`,
      content: '',
      wordCount: 0,
      status: 'draft'
    }
    setChapters([...chapters, newChapter])
    setActiveChapterId(newChapter.id)
  }

  // Bölüm güncelleme
  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters(chapters.map(ch =>
      ch.id === id ? { ...ch, ...updates } : ch
    ))
  }

  // Kaydetme işlemi
  const handleSave = (publish: boolean) => {
    const storyData = {
      ...storyInfo,
      chapters,
      status: publish ? 'published' : 'draft',
      createdAt: new Date().toISOString()
    }

    console.log('Kaydedilen hikaye:', storyData)
    router.push('/dashboard/stories')
  }

  return (
    <div className="container py-8">
      {/* Başlık ve Aksiyon Butonları */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Hikaye Editörü</h1>
          {storyInfo.title && (
            <p className="text-muted-foreground">"{storyInfo.title}" hikayesini düzenliyorsunuz</p>
          )}
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
            Taslak Kaydet
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

      {/* Hikaye Temel Bilgileri */}
      <div className="mb-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="story-title">Hikaye Başlığı</Label>
          <Input
            id="story-title"
            placeholder="Hikayenizin başlığını girin"
            value={storyInfo.title}
            onChange={(e) => updateStoryInfo({ title: e.target.value })}
            className="text-lg font-medium"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="story-description">Hikaye Açıklaması</Label>
          <Textarea
            id="story-description"
            placeholder="Hikayenizin kısa açıklamasını yazın"
            value={storyInfo.description}
            onChange={(e) => updateStoryInfo({ description: e.target.value })}
            rows={3}
          />
        </div>
      </div>



      {/* Bölüm Durum Bilgisi */}
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
        {/* Ana İçerik */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="editor">
                <Icons.edit className="mr-2 h-4 w-4" />
                Editör
              </TabsTrigger>
              <TabsTrigger value="chapters">
                <Icons.list className="mr-2 h-4 w-4" />
                Bölümler ({chapters.length})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Icons.settings className="mr-2 h-4 w-4" />
                Ayarlar
              </TabsTrigger>
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
                    <Icons.plus className="mr-2 h-4 w-4" />
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

        {/* Yan Menü */}
        <div className="space-y-6">
          <div className="lg:col-span-1">
            <CoverImageUploader
              image={storyInfo.coverImage}
              onImageChange={handleCoverImageChange}
            />
          </div>
          <StorySidebar
            storyInfo={storyInfo}
            chapters={chapters}
            onSaveDraft={() => handleSave(false)}
            onPublish={() => handleSave(true)}
            onUpdateStory={updateStoryInfo}
          />
        </div>
      </div>

      {/* Önizleme Modali */}
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