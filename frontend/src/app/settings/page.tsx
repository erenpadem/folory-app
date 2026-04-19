'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
} from '@/components/ui/app-tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Lock, Bell, Shield, Image as ImageIcon, Save, X, Loader2 } from 'lucide-react'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import api from '@/shared/lib/api-client'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { requestEmailChange, confirmEmailChange } from '@/services/user.service'

export default function SettingsPage() {
  const { user, isAuthenticated, loading, fetchUser } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Email change states
  const [emailChangeNew, setEmailChangeNew] = useState('')
  const [emailChangePassword, setEmailChangePassword] = useState('')
  const [emailChangeCode, setEmailChangeCode] = useState('')
  const [emailChangePendingFor, setEmailChangePendingFor] = useState<string | null>(null)
  const [emailChangeBusy, setEmailChangeBusy] = useState(false)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [commentReplies, setCommentReplies] = useState(true)
  const [newBooks, setNewBooks] = useState(true)
  
  useEffect(() => {
    if (!loading && !isAuthenticated && !user) {
      router.push('/auth/login?returnTo=/settings')
    }
  }, [isAuthenticated, user, router, loading])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio ?? '')
      setPhone(user.phone ?? '')
      setAvatar(user.avatar || null)
      setCoverImage(user.coverImage ?? null)
    }
  }, [user])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      name?: string
      bio?: string
      phone?: string
      avatar?: string
      cover_image?: string
    }) => {
      // TODO: Implement profile update API endpoint
      const response = await api.put('/api/user/profile', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Profil başarıyla güncellendi')
      setIsEditing(false)
      fetchUser()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Profil güncellenirken bir hata oluştu')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; password: string; password_confirmation: string }) => {
      // TODO: Implement password change API endpoint
      const response = await api.post('/api/user/change-password', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Şifre başarıyla değiştirildi')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu')
    },
  })

  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: { email_notifications: boolean; comment_replies: boolean; new_books: boolean }) => {
      // TODO: Implement notification settings API endpoint
      const response = await api.put('/api/user/notification-settings', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Bildirim ayarları güncellendi')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Bildirim ayarları güncellenirken bir hata oluştu')
    },
  })

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      name,
      bio,
      phone: phone.trim() ? phone.trim() : undefined,
      avatar: avatar ?? undefined,
      cover_image: coverImage ?? undefined,
    })
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }
    changePasswordMutation.mutate({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    })
  }

  const handleRequestEmailChange = async () => {
    const next = emailChangeNew.trim().toLowerCase()
    if (!next || !next.includes('@')) {
      toast.error('Geçerli bir yeni e-posta girin')
      return
    }
    if (!emailChangePassword) {
      toast.error('Mevcut şifrenizi girin')
      return
    }
    try {
      setEmailChangeBusy(true)
      await requestEmailChange({ password: emailChangePassword, new_email: next })
      toast.success('Doğrulama kodu yeni e-posta adresinize gönderildi')
      setEmailChangePendingFor(next)
      setEmailChangeCode('')
    } catch {
      /* axios interceptor */
    } finally {
      setEmailChangeBusy(false)
    }
  }

  const handleConfirmEmailChange = async () => {
    if (!emailChangePendingFor || emailChangeCode.replace(/\D/g, '').length !== 6) {
      toast.error('6 haneli kodu girin')
      return
    }
    try {
      setEmailChangeBusy(true)
      await confirmEmailChange({
        new_email: emailChangePendingFor,
        code: emailChangeCode.replace(/\D/g, ''),
      })
      toast.success('E-posta adresiniz güncellendi')
      setEmailChangePendingFor(null)
      setEmailChangeCode('')
      setEmailChangeNew('')
      setEmailChangePassword('')
      await fetchUser()
    } catch {
      /* axios interceptor */
    } finally {
      setEmailChangeBusy(false)
    }
  }

  const handleUpdateNotificationSettings = () => {
    updateNotificationSettingsMutation.mutate({
      email_notifications: emailNotifications,
      comment_replies: commentReplies,
      new_books: newBooks,
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">Hesap ve tercih ayarlarınızı yönetin</p>
      </div>

      <AppTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <AppTabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <AppTabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </AppTabsTrigger>
          <AppTabsTrigger value="account">
            <Lock className="mr-2 h-4 w-4" />
            Hesap
          </AppTabsTrigger>
          <AppTabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Bildirimler
          </AppTabsTrigger>
          <AppTabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Gizlilik
          </AppTabsTrigger>
        </AppTabsList>

        {/* Profile Settings */}
        <AppTabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Profil bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className={getAvatarColor(user.name)}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Profil Resmi Değiştir
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG veya GIF. Maksimum 2MB
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biyografi</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                />
                <p className="text-sm text-muted-foreground">
                  İsteğe bağlı. SMS doğrulaması şu an devre dışı.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Kapak Resmi</Label>
                <div className="flex items-center gap-4">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="h-32 w-full object-cover rounded-md"
                    />
                  )}
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Kapak Resmi Yükle
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG veya GIF. Maksimum 5MB
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setName(user.name)
                    setBio(user.bio ?? '')
                    setPhone(user.phone ?? '')
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AppTabsContent>

        {/* Account Settings */}
        <AppTabsContent value="account" className="space-y-6">
          {/* Email Change */}
          <Card>
            <CardHeader>
              <CardTitle>E-posta Adresi</CardTitle>
              <CardDescription>
                Mevcut şifrenizi girin; yeni adrese 6 haneli kod gönderilir. Onay sonrası eski adresinize bilgi
                e-postası gider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mevcut E-posta</Label>
                <Input value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email-new">Yeni e-posta</Label>
                <Input
                  id="settings-email-new"
                  type="email"
                  value={emailChangeNew}
                  onChange={(e) => setEmailChangeNew(e.target.value)}
                  disabled={!!emailChangePendingFor}
                  placeholder="yeni@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email-pw">Mevcut şifre</Label>
                <Input
                  id="settings-email-pw"
                  type="password"
                  autoComplete="current-password"
                  value={emailChangePassword}
                  onChange={(e) => setEmailChangePassword(e.target.value)}
                  disabled={!!emailChangePendingFor}
                />
              </div>
              {!emailChangePendingFor ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRequestEmailChange}
                  disabled={emailChangeBusy || !emailChangeNew.trim() || !emailChangePassword}
                >
                  {emailChangeBusy ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Doğrulama kodu gönder
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="settings-email-code">6 haneli kod</Label>
                    <Input
                      id="settings-email-code"
                      inputMode="numeric"
                      maxLength={6}
                      className="font-mono tracking-widest text-lg"
                      value={emailChangeCode}
                      onChange={(e) =>
                        setEmailChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={handleConfirmEmailChange}
                      disabled={emailChangeBusy || emailChangeCode.length !== 6}
                    >
                      {emailChangeBusy ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      E-postayı güncelle
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEmailChangePendingFor(null)
                        setEmailChangeCode('')
                        setEmailChangePassword('')
                      }}
                      disabled={emailChangeBusy}
                    >
                      İptal
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleRequestEmailChange}
                      disabled={emailChangeBusy}
                    >
                      Kodu tekrar gönder
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>Hesap güvenliğiniz için düzenli olarak şifrenizi değiştirin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
              >
                <Lock className="h-4 w-4 mr-2" />
                {changePasswordMutation.isPending ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
              </Button>
            </CardContent>
          </Card>
        </AppTabsContent>

        {/* Notification Settings */}
        <AppTabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Önemli güncellemeler için e-posta alın
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="comment-replies">Yorum Yanıtları</Label>
                  <p className="text-sm text-muted-foreground">
                    Yorumlarınıza yanıt geldiğinde bildirim alın
                  </p>
                </div>
                <Switch
                  id="comment-replies"
                  checked={commentReplies}
                  onCheckedChange={setCommentReplies}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-books">Yeni Kitaplar</Label>
                  <p className="text-sm text-muted-foreground">
                    Takip ettiğiniz yazarlar yeni kitap yayınladığında bildirim alın
                  </p>
                </div>
                <Switch
                  id="new-books"
                  checked={newBooks}
                  onCheckedChange={setNewBooks}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleUpdateNotificationSettings}
                  disabled={updateNotificationSettingsMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateNotificationSettingsMutation.isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AppTabsContent>

        {/* Privacy Settings */}
        <AppTabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Gizlilik Ayarları</CardTitle>
              <CardDescription>Hesabınızın gizlilik ayarlarını yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gizlilik ayarları yakında eklenecek.
                </p>
              </div>
            </CardContent>
          </Card>
        </AppTabsContent>
      </AppTabs>
    </div>
  )
}

