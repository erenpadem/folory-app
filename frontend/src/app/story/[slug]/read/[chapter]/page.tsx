// app/story/[slug]/read/[chapter]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Bookmark, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { Chapter, Story } from '@/types/story'
import { ReadingSettings } from '@/components/reading/ReadingSettings'
import { ChapterView } from '@/components/reading/ChapterView'


export default function ChapterReader() {
  const { slug, chapter: chapterParam } = useParams()
  const router = useRouter()
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Mock data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockStory: Story = {
        id: "1",
        slug: slug as string,
        title: "Karanlık Ormanın Sırları",
        author: "Ayşe Yılmaz",
        coverImage: "/placeholder-cover.jpg",
        chapters: Array.from({ length: 24 }, (_, i) => ({
          id: `ch-${i + 1}`,
          number: i + 1,
          title: `Bölüm ${i + 1}: ${['Gizem Başlıyor', 'Kayıp Çocuk', 'Ormanın Derinlikleri', 'Sır Perdesi'][i % 4] || 'Yeni Macera'}`,
          content: generateMockChapterContent(i + 1),
          wordCount: 3500 + (i * 100),
          publishedAt: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)).toISOString()
        })),
        readingTime: 145 // minutes
      }

      setStory(mockStory)
      setChapter(mockStory.chapters.find(ch => ch.number === Number(chapterParam)) || null)
      setIsLoading(false)
    }

    fetchData()
  }, [slug, chapterParam])

  const goToChapter = (chapterNumber: number) => {
    router.push(`/story/${slug}/read/${chapterNumber}`)
  }

  const nextChapter = () => {
    if (chapter && story) {
      const next = chapter.number + 1
      if (next <= story.chapters.length) {
        goToChapter(next)
      }
    }
  }

  const prevChapter = () => {
    if (chapter && chapter.number > 1) {
      goToChapter(chapter.number - 1)
    }
  }

  if (isLoading || !chapter || !story) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-pulse rounded-full h-12 w-12 bg-muted mx-auto" />
          <p>Bölüm yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/90 backdrop-blur z-10 py-4">
        <Button variant="ghost" onClick={() => router.push(`/story/${slug}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Hikayeye Dön
        </Button>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Reading Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 border rounded-lg bg-background">
          <ReadingSettings
            fontSize={fontSize}
            lineHeight={lineHeight}
            onFontSizeChange={setFontSize}
            onLineHeightChange={setLineHeight}
          />
        </div>
      )}

      {/* Chapter Info */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">{chapter.title}</h1>
        <p className="text-muted-foreground">
          Bölüm {chapter.number} • {Math.round(chapter.wordCount / 200)} dakika okuma • {new Date(chapter.publishedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={(chapter.number / story.chapters.length) * 100} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>%{Math.round((chapter.number / story.chapters.length) * 100)} Tamamlandı</span>
          <span>Bölüm {chapter.number}/{story.chapters.length}</span>
        </div>
      </div>

      {/* Chapter Content */}
      <ChapterView
        content={chapter.content}
        fontSize={fontSize}
        lineHeight={lineHeight}
      />

      {/* Chapter Navigation */}
      <div className="flex justify-between gap-4 sticky bottom-0 bg-background/90 backdrop-blur py-4 border-t">
        <Button 
          variant="outline" 
          onClick={prevChapter}
          disabled={chapter.number <= 1}
          className="flex-1"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Önceki Bölüm
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Menu className="mr-2 h-4 w-4" />
              Bölümler
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-96 w-64 overflow-y-auto">
            {story.chapters.map((ch) => (
              <DropdownMenuItem 
                key={ch.id} 
                onClick={() => goToChapter(ch.number)}
                className={`flex flex-col items-start ${ch.number === chapter.number ? 'bg-accent' : ''}`}
              >
                <span className="font-medium">{ch.title}</span>
                <span className="text-xs text-muted-foreground">
                  Bölüm {ch.number} • {Math.round(ch.wordCount / 200)} dakika
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          onClick={nextChapter}
          disabled={!story || chapter.number >= story.chapters.length}
          className="flex-1"
        >
          Sonraki Bölüm
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Mock chapter content generator
function generateMockChapterContent(chapterNumber: number): string {
  const titles = [
    "Gizem Başlıyor",
    "Kayıp Çocuk",
    "Ormanın Derinlikleri",
    "Sır Perdesi"
  ]
  const title = titles[chapterNumber % titles.length] || "Yeni Macera"
  
  return `
    <h1>Bölüm ${chapterNumber}: ${title}</h1>
    
    <p>Kasabanın üzerine çöken sis, her zamankinden daha yoğundu. Elif, pencereden dışarı bakarken, ormandan gelen o tuhaf sesleri duyduğunda içine bir korku düştü. Sanki bir şey, ya da birileri, karanlıkta onu izliyordu.</p>
    
    <p>"Bu sefer farklı," diye mırıldandı kendi kendine. Daha önce hiç böyle hissetmemişti. Odasında tek başına otururken, telefonu çaldı.</p>
    
    <h2>${title}</h2>
    
    <p>Telefondaki ses tanıdıktı. "Elif, hemen okula gelmelisin. Efe kayıp!"</p>
    
    <p>Elif'in kalbi yerinden fırlayacak gibi oldu. Efe, küçük kardeşiydi ve okuldan eve dönmemişti. Hemen ceketini kapıp dışarı fırladı.</p>
    
    <p>Kasaba meydanına vardığında, kalabalık bir grubun toplandığını gördü. İnsanların yüzlerindeki ifade, durumun ciddiyetini anlatıyordu.</p>
  `
}