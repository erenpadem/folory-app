// components/profile/ProfileSettings.tsx
'use client'

import { User } from '@/types/auth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  updateUserProfile,
  changePassword,
  sendPasswordResetToEmail,
  deactivateAccount,
  deleteAccount,
  requestEmailChange,
  confirmEmailChange,
} from '@/services/user.service'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { KeyRound, Loader2, Lock, Mail, Trash2, UserX } from 'lucide-react'

interface ProfileSettingsProps {
  user: User
}

export const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const { fetchUser, logout } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username ?? user.email.split('@')[0] ?? '',
    email: user.email,
    phone: user.phone ?? '',
  })

  const [emailChangeNew, setEmailChangeNew] = useState('')
  const [emailChangePassword, setEmailChangePassword] = useState('')
  const [emailChangeCode, setEmailChangeCode] = useState('')
  const [emailChangePendingFor, setEmailChangePendingFor] = useState<string | null>(null)
  const [emailChangeBusy, setEmailChangeBusy] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sendingReset, setSendingReset] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deactivatePassword, setDeactivatePassword] = useState('')
  const [deactivateAck, setDeactivateAck] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteAck, setDeleteAck] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setFormData({
      name: user.name,
      username: user.username ?? user.email.split('@')[0] ?? '',
      email: user.email,
      phone: user.phone ?? '',
    })
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const savePromise = (async () => {
      await updateUserProfile({
        name: formData.name,
        username: formData.username,
        phone: formData.phone.trim() ? formData.phone.trim() : null,
      })
      await fetchUser()
    })()

    toast.promise(savePromise, {
      loading: 'Ayarlar kaydediliyor...',
      success: 'Profil ayarlarınız başarıyla güncellendi!',
      error: 'Ayarlar kaydedilirken bir hata oluştu',
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Yeni şifre en az 8 karakter olmalıdır')
      return
    }
    try {
      setChangingPassword(true)
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      toast.success('Şifreniz güncellendi')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      /* api-client toast */
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSendResetEmail = async () => {
    try {
      setSendingReset(true)
      await sendPasswordResetToEmail()
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi')
    } catch {
      /* api-client toast */
    } finally {
      setSendingReset(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateAck) {
      toast.error('Devre dışı bırakmayı onaylamanız gerekir')
      return
    }
    try {
      setDeactivating(true)
      await deactivateAccount({
        password: deactivatePassword,
        acknowledge: true,
      })
      toast.success('Hesabınız devre dışı bırakıldı')
      setDeactivateOpen(false)
      setDeactivatePassword('')
      setDeactivateAck(false)
      await logout()
      router.push('/auth/login')
    } catch {
      /* api-client toast */
    } finally {
      setDeactivating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteAck) {
      toast.error('Hesap silmeyi onaylamanız gerekir')
      return
    }
    try {
      setDeleting(true)
      await deleteAccount({
        password: deletePassword,
        acknowledge: true,
      })
      toast.success('Hesabınız silindi')
      setDeleteOpen(false)
      setDeletePassword('')
      setDeleteAck(false)
      await logout()
      router.push('/')
    } catch {
      /* api-client toast */
    } finally {
      setDeleting(false)
    }
  }

  const resetEmailChangeFlow = () => {
    setEmailChangePendingFor(null)
    setEmailChangeCode('')
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
      await requestEmailChange({
        password: emailChangePassword,
        new_email: next,
      })
      toast.success('Doğrulama kodu yeni e-posta adresinize gönderildi')
      setEmailChangePendingFor(next)
      setEmailChangeCode('')
    } catch {
      /* api-client toast */
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
      resetEmailChangeFlow()
      setEmailChangeNew('')
      setEmailChangePassword('')
      await fetchUser()
    } catch {
      /* api-client toast */
    } finally {
      setEmailChangeBusy(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil bilgileri</CardTitle>
            <CardDescription>Ad ve kullanıcı adınızı güncelleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+90 5xx xxx xx xx"
                value={formData.phone}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                İsteğe bağlı. SMS doğrulaması şu an devre dışı; ileride numaranızı doğrulamak için kullanılabilir.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Adresi değiştirmek için aşağıdaki &quot;E-posta değiştir&quot; bölümünü kullanın.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Kaydet</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-posta değiştir
          </CardTitle>
          <CardDescription>
            Mevcut şifrenizi girin; yeni adrese 6 haneli kod gönderilir. Onayladıktan sonra eski adresinize bilgi
            e-postası gider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-change-new">Yeni e-posta</Label>
            <Input
              id="email-change-new"
              type="email"
              autoComplete="email"
              value={emailChangeNew}
              onChange={(e) => setEmailChangeNew(e.target.value)}
              disabled={!!emailChangePendingFor}
              placeholder="yeni@ornek.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-change-pw">Mevcut şifre (doğrulama)</Label>
            <Input
              id="email-change-pw"
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Doğrulama kodu gönder
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-change-code">Yeni adrese gelen 6 haneli kod</Label>
                <Input
                  id="email-change-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  E-postayı güncelle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetEmailChangeFlow()
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Şifre
          </CardTitle>
          <CardDescription>
            Oturumdayken şifrenizi değiştirin veya e-posta ile sıfırlama bağlantısı alın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Mevcut şifre</Label>
              <Input
                id="current-pw"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">Yeni şifre</Label>
              <Input
                id="new-pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Yeni şifre (tekrar)</Label>
              <Input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {changingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Şifreyi güncelle
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Şifrenizi unuttuysanız kayıtlı e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendResetEmail}
              disabled={sendingReset}
            >
              {sendingReset ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              E-postaya sıfırlama bağlantısı gönder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Hesap sonlandırma</CardTitle>
          <CardDescription>
            Hesabınızı geçici olarak kapatın veya kalıcı olarak silin. Bu işlemler için şifre gerekir.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeactivateOpen(true)}>
            <UserX className="h-4 w-4 mr-2" />
            Hesabı devre dışı bırak
          </Button>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hesabı sil
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesabı devre dışı bırak</DialogTitle>
            <DialogDescription>
              Giriş yapamazsınız; içerikleriniz saklanır. Tekrar açmak için destek ile iletişime geçmeniz
              gerekebilir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deact-pw">Şifreniz</Label>
              <Input
                id="deact-pw"
                type="password"
                autoComplete="current-password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="deact-ack"
                checked={deactivateAck}
                onCheckedChange={(v) => setDeactivateAck(v === true)}
              />
              <Label htmlFor="deact-ack" className="text-sm font-normal leading-snug cursor-pointer">
                Hesabımı devre dışı bırakmak istediğimi onaylıyorum
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivating || !deactivatePassword}
            >
              {deactivating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Devre dışı bırak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesabı kalıcı olarak sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Profiliniz ve hesabınıza bağlı veriler silinir (uygulama politikasına göre).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="del-pw">Şifreniz</Label>
              <Input
                id="del-pw"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="del-ack"
                checked={deleteAck}
                onCheckedChange={(v) => setDeleteAck(v === true)}
              />
              <Label htmlFor="del-ack" className="text-sm font-normal leading-snug cursor-pointer">
                Hesabımı kalıcı olarak silmek istediğimi anlıyorum
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hesabı sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
