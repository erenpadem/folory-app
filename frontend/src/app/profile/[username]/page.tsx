'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  Edit,
  Calendar,
  Check,
  X,
  Mail,
  Key,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Menu,
  Download,
  Share2,
  Loader2,
  Trash2
} from 'lucide-react'
import { StoryCard } from '@/components/story/StoryCard'
import toast from 'react-hot-toast'
import { CommentCard } from '@/components/comment-card'

export default function ProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('about')
  const [isEditing, setIsEditing] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    commentNotifications: true
  })
  
  // Mock data
  const isCurrentUser = username === 'currentuser'
  const isAuthor = true
  const user = {
    name: 'Ahmet Yılmaz',
    username: username as string,
    bio: 'Fantastik kurgu yazarı ve kitap sever',
    email: 'ahmet@example.com',
    emailVerified: true,
    joinDate: '2022-03-15',
    avatar: '/placeholder-avatar.jpg',
    coverImage: '/placeholder-cover.jpg',
    stats: {
      stories: 12,
      followers: 542,
      following: 123,
      comments: 89
    }
  }

  // Mock data - Gerçekte API'den çekilecek
  const stories = Array(5).fill(0).map((_, i) => ({
    id: `story-${i}`,
    title: `Örnek Hikaye ${i + 1}`,
    excerpt: 'Bu hikayenin kısa bir açıklaması...',
    coverImage: '/placeholder-cover.jpg',
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 50),
    createdAt: '2023-05-15'
  }))

  const comments = Array(3).fill(0).map((_, i) => ({
    id: `comment-${i}`,
    storyTitle: `Hikaye ${i + 1}`,
    content: 'Bu hikayeyi çok beğendim, devamını sabırsızlıkla bekliyorum!',
    createdAt: '2023-06-20'
  }))

  const savedStories = Array(4).fill(0).map((_, i) => ({
    id: `saved-${i}`,
    title: `Kaydedilen Hikaye ${i + 1}`,
    author: 'Farklı Yazar',
    excerpt: 'Kaydettiğim bir hikaye...',
    savedAt: '2023-06-10'
  }))

  const handleSaveProfile = () => {
    toast.success('Profil bilgileri güncellendi!')
    setIsEditing(false)
  }

  return (
    <div className="pb-12">
      {/* Kapak fotoğrafı */}
      <div className="h-48 w-full bg-muted relative">
        <img 
          src={user.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        {isCurrentUser && (
          <Button 
            variant="outline" 
            className="absolute top-4 right-4"
            onClick={() => console.log('Kapak fotoğrafı değiştir')}
          >
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
        )}
      </div>

      {/* Profil bilgileri */}
      <div className="container relative">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex flex-col items-center md:items-start -mt-16">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <div className="w-full mt-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Biyografi</Label>
                  <Textarea id="bio" defaultValue={user.bio} rows={3} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Kaydet</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2">{user.bio}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Calendar className="inline mr-1 h-4 w-4" />
                  {new Date(user.joinDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long'
                  })} tarihinden beri üye
                </p>
                {isCurrentUser && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Profili Düzenle
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="md:w-3/4 mt-4">
            {/* İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hikayeler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.stats.stories}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Takipçiler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.stats.followers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Takip Edilen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.stats.following}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.stats.comments}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tablar */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="about">Hakkında</TabsTrigger>
                {isAuthor && <TabsTrigger value="stories">Hikayeler</TabsTrigger>}
                <TabsTrigger value="comments">Yorumlar</TabsTrigger>
                <TabsTrigger value="saved">Kaydedilenler</TabsTrigger>
                {isCurrentUser && <TabsTrigger value="settings">Ayarlar</TabsTrigger>}
              </TabsList>

              {/* Hakkında */}
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hakkında</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">E-posta</h3>
                        <p className="text-muted-foreground">
                          {user.email}
                          {user.emailVerified ? (
                            <span className="ml-2 text-green-500">
                              <Check className="inline h-4 w-4" /> Doğrulanmış
                            </span>
                          ) : (
                            <span className="ml-2 text-yellow-500">
                              <X className="inline h-4 w-4" /> Doğrulanmamış
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Topluluk Katılımı</h3>
                        <p className="text-muted-foreground">
                          {user.stats.comments} yorum, {user.stats.followers} takipçi
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hikayeler (sadece yazarlar için) */}
              {isAuthor && (
                <TabsContent value="stories" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stories.map(story => (
                      <StoryCard 
                        key={story.id}
                        story={story}
                        showAuthor={false}
                        onEdit={isCurrentUser ? () => router.push(`/dashboard/stories/${story.id}/edit`) : undefined}
                      />
                    ))}
                  </div>
                </TabsContent>
              )}

              {/* Yorumlar */}
              <TabsContent value="comments" className="mt-6">
                <div className="space-y-4">
                  {comments.map(comment => (
                    <CommentCard 
                      key={comment.id}
                      comment={comment}
                      onDelete={isCurrentUser ? () => console.log('Yorum silindi') : undefined}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Kaydedilenler */}
              <TabsContent value="saved" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedStories.map(story => (
                    <StoryCard 
                      key={story.id}
                      story={story}
                      showAuthor={true}
                      savedDate={story.savedAt}
                      onRemove={isCurrentUser ? () => console.log('Kaldırıldı') : undefined}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Ayarlar (sadece kendi profili için) */}
              {isCurrentUser && (
                <TabsContent value="settings" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Hesap Ayarları</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <Label>E-posta Adresi</Label>
                          <div className="flex items-center gap-2">
                            <Input value={user.email} disabled />
                            {user.emailVerified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Doğrulanmış
                              </span>
                            ) : (
                              <Button variant="outline" size="sm">
                                Doğrula
                              </Button>
                            )}
                          </div>
                        </div>
                        <Button variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          E-posta Değiştir
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Şifre</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline">
                          <Key className="mr-2 h-4 w-4" />
                          Şifre Değiştir
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Gizlilik</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="private-profile">Profilimi gizli yap</Label>
                            <p className="text-sm text-muted-foreground">
                              Profilinizi sadece takipçileriniz görebilir
                            </p>
                          </div>
                          <Switch
                            id="private-profile"
                            checked={privacySettings.isPrivate}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, isPrivate: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="comment-notifications">Yorum bildirimleri</Label>
                            <p className="text-sm text-muted-foreground">
                              Hikayelerinize yapılan yorumlardan haberdar olun
                            </p>
                          </div>
                          <Switch
                            id="comment-notifications"
                            checked={privacySettings.commentNotifications}
                            onCheckedChange={(checked) => setPrivacySettings({...privacySettings, commentNotifications: checked})}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}