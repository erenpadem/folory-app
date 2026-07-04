'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthForm } from '@/components/Auth/AuthForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MeshBackground from '@/components/Styling/MeshBackground'
import { AuthApi } from '@/features/auth/infrastructure/api/auth.api'
import { useAuth } from '@/features/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const authApi = new AuthApi()

export default function VerifyEmailPage() {
  const { fetchUser } = useAuth()
  const router = useRouter()
  const [resending, setResending] = useState(false)

  const handleVerify = async (data: { code: string }) => {
    try {
      await authApi.verifyEmailWithCode(data.code)
      await fetchUser()
      toast.success('E-posta adresiniz doğrulandı')
      router.push('/settings')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Doğrulama başarısız')
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authApi.resendVerificationEmail()
      toast.success('Doğrulama e-postası gönderildi')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'E-posta gönderilemedi')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen relative ">
      <MeshBackground />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">E-posta Doğrulama</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center mb-4">
            E-postanıza gelen 6 haneli kodu girin. Yazar olmak için bu adım zorunludur.
          </p>
          <AuthForm type="verify" onSubmit={handleVerify} />
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Gönderiliyor...' : 'Kodu tekrar gönder'}
          </Button>
          <Button variant="link" className="w-full mt-2" asChild>
            <Link href="/settings">Ayarlara dön</Link>
          </Button>
          <Button variant="link" className="w-full" asChild>
            <Link href="/auth/login">Giriş sayfasına dön</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
