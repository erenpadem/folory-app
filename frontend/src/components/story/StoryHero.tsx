import { Bookmark, BookmarkCheck, Heart, MoreVertical, Play, Share2, Star,FlagIcon,UserIcon,TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { Story } from "@/types/story"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StoryHeroProps {
  story: Story
  isSaved: boolean
  isLiked: boolean
  onSave: () => void
  onLike: () => void
  showFullDescription: boolean
  onToggleDescription: () => void
}

export function StoryHero({
  story,
  isSaved,
  isLiked,
  onSave,
  onLike,
  showFullDescription,
  onToggleDescription
}: StoryHeroProps) {
  // Basit ikon bileşenleri (lucide-react kullanarak)
  const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>

  const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  return (
    <div className="container pb-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Story Cover */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg bg-muted">
            {story.cover ? (
              <Image
                src={story.cover}
                alt={story.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <span className="text-lg text-muted-foreground">Kapak Resmi Yok</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
              <Button className="w-full gap-2">
                <Play className="h-4 w-4" />
                {story.readingProgress ? 'Okumaya Devam Et' : 'Okumaya Başla'}
              </Button>
            </div>
          </div>
        </div>

        {/* Story Info */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{story.title}</h1>
              <p className="text-lg text-muted-foreground">{story.author}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onSave}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </Button>

     
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Paylaşım Seçenekleri</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Bu hikayeyi paylaşmak için bir yöntem seçin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Bağlantıyı Kopyala</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-muted/50 border-border flex-1"
                          value={`${window.location.origin}/story/${story.slug}`}
                          readOnly
                        />
                        <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/story/${story.slug}`)}>
                          Kopyala
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="gap-2">
                        <TwitterIcon className="h-4 w-4" />
                        Twitter
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <FacebookIcon className="h-4 w-4" />
                        Facebook
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Kapat</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xs bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Diğer İşlemler</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-1 py-2">
                    <DialogClose asChild>
                      <Button variant="ghost" className="justify-start gap-2">
                        <FlagIcon className="h-4 w-4" />
                        Şikayet Et
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="ghost" className="justify-start gap-2">
                        <TrashIcon className="h-4 w-4" />
                        Geçmişi Temizle
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="ghost" className="justify-start gap-2">
                        <UserIcon className="h-4 w-4" />
                        Yazar Profili
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{story.genre}</Badge>
            <Badge variant="secondary">{story.status}</Badge>
            <Badge variant="secondary">{story.chapters.length} Bölüm</Badge>
            {story.readingProgress && (
              <Badge variant="default">
                %{story.readingProgress.percentage} Tamamlandı
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{story.rating}</span>
              <span className="text-muted-foreground">({story.likes})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={onLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                Beğen
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className={`text-muted-foreground ${showFullDescription ? '' : 'line-clamp-3'}`}>
              {story.description}
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              onClick={onToggleDescription}
            >
              {showFullDescription ? 'Daha az göster' : 'Devamını oku'}
            </Button>
          </div>

          {story.readingProgress && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Okuma Durumu</span>
                <span>Bölüm {story.readingProgress.currentChapter}/{story.chapters.length}</span>
              </div>
              <Progress value={story.readingProgress.percentage} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Son Güncelleme</p>
              <p className="font-medium">{story.lastUpdated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yayın Tarihi</p>
              <p className="font-medium">{story.publishedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kelime Sayısı</p>
              <p className="font-medium">{story.wordCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bölüm Sayısı</p>
              <p className="font-medium">{story.chapters.length}</p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              {story.readingProgress ? 'Okumaya Devam Et' : 'Okumaya Başla'}
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <BookmarkCheck className="h-5 w-5" />
              Son Okuduğum Yer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}