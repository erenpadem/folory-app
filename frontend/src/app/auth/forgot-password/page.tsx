'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MeshBackground from '@/components/Styling/MeshBackground'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { requestPasswordResetCode, resetPasswordWithCode } from '@/services/user.service'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('E-posta adresinizi girin')
      return
    }
    try {
      setLoading(true)
      await requestPasswordResetCode(email.trim())
      toast.success('Kayıtlı adres ise 6 haneli kod e-postanıza gönderildi.')
      setStep(2)
    } catch {
      /* api-client toast */
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      toast.error('Şifreler eşleşmiyor')
      return
    }
    if (password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır')
      return
    }
    try {
      setLoading(true)
      await resetPasswordWithCode({
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      toast.success('Şifreniz güncellendi. Giriş yapabilirsiniz.')
      router.push('/auth/login')
    } catch {
      /* api-client toast */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative py-12">
      <MeshBackground />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 ? 'Şifremi Unuttum' : 'Kodu ve yeni şifreyi girin'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Gönderiliyor...' : '6 haneli kod gönder'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">6 haneli kod</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Yeni şifre</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password2">Yeni şifre (tekrar)</Label>
                <Input
                  id="password2"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Şifreyi sıfırla'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                E-postayı değiştir
              </Button>
            </form>
          )}
          <Button variant="link" className="w-full mt-4" asChild>
            <Link href="/auth/login">Giriş sayfasına dön</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
