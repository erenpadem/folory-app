'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthForm } from '@/components/Auth/AuthForm'
import { AuthSocial } from '@/components/Auth/AuthSocial'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MeshBackground from '@/components/Styling/MeshBackground'
import toast from 'react-hot-toast'
import { useAuth } from '@/app/contexts/AuthContext'  // AuthProvider'dan hook

export default function LoginPage() {
  const { login, register, loading } = useAuth()

  return (
    <div className="flex items-center justify-center h-screen relative ">
      <MeshBackground />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Folory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <AuthForm
                type="login"
                onSubmit={async (data) => {
                  try {
                    await login(data)
                    toast.success('Giriş başarılı')
                    // router.push zaten AuthProvider'da var, buraya gerek yok
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Giriş başarısız')
                  }
                }}
                footer={
                  <Button variant="link" className="px-0 text-sm" asChild>
                    <Link href="/auth/forgot-password">Şifremi unuttum</Link>
                  </Button>
                }
                loading={loading}
              />
              <AuthSocial />
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <AuthForm
                type="register"
                onSubmit={async (data) => {
                  try {
                    await register(data)
                    toast.success('Kayıt başarılı, giriş yapabilirsiniz')
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Kayıt başarısız')
                  }
                }}
                loading={loading}
              />
              <AuthSocial />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
