'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthForm } from '@/components/Auth/AuthForm'
import { AuthSocial } from '@/components/Auth/AuthSocial'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MeshBackground from '@/components/Styling/MeshBackground'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { 
    login, 
    register, 
    loading, 
    user, 
    isAuthenticated,
  } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const authTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const returnToParam = searchParams.get('returnTo')
  const registerTabHref =
    returnToParam !== null
      ? `/auth/login?tab=register&returnTo=${encodeURIComponent(returnToParam)}`
      : '/auth/login?tab=register'
  const loginTabHref =
    returnToParam !== null
      ? `/auth/login?tab=login&returnTo=${encodeURIComponent(returnToParam)}`
      : '/auth/login?tab=login'

  useEffect(() => {
    if (isAuthenticated && user) {
      const returnTo = searchParams.get('returnTo')
      if (returnTo) {
        router.push(returnTo)
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, router, searchParams])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      await login(credentials)
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...')
      // Redirect will be handled by useEffect
    } catch (err) {
      // Error is already handled by the auth store
    }
  }

  const handleRegister = async (data: { 
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    try {
      await register(data)
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
    } catch (err) {
      // Error is already handled by the auth store
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <MeshBackground />
      <Card className="w-full max-w-md mx-4 z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Folory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={authTab} key={authTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <AuthForm
                type="login"
                onSubmit={handleLogin}
                footer={
                  <div className="flex justify-between w-full">
                    <Button variant="link" className="px-0 text-sm" asChild>
                      <Link href="/auth/forgot-password">Şifremi unuttum</Link>
                    </Button>
                    <Button variant="link" className="px-0 text-sm" asChild>
                      <Link href={registerTabHref}>Hesabın yok mu?</Link>
                    </Button>
                  </div>
                }
                loading={loading}
              />
              <AuthSocial loading={loading} />
            </TabsContent>

            <TabsContent value="register">
              <AuthForm
                type="register"
                onSubmit={handleRegister}
                footer={
                  <Button variant="link" className="px-0 text-sm" asChild>
                    <Link href={loginTabHref}>Zaten hesabın var mı?</Link>
                  </Button>
                }
                loading={loading}
              />
              <AuthSocial loading={loading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}