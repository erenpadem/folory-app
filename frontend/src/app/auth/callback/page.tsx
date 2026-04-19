'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { Check } from 'lucide-react'
import toast from 'react-hot-toast'
import MeshBackground from '@/components/Styling/MeshBackground'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, fetchUser, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const token = searchParams.get('token')
        const provider = searchParams.get('provider')
        const error = searchParams.get('error')

        if (error) {
          toast.error(decodeURIComponent(error))
          router.push('/auth/login')
          return
        }

        if (!token) {
          toast.error('Token bulunamadı. Lütfen tekrar deneyin.')
          router.push('/auth/login')
          return
        }

        // Save token to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }

        // Fetch user data using API directly since we have the token
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
          const response = await fetch(`${apiUrl}/api/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            credentials: 'include',
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data?.user) {
              // User data is available, fetchUser will use the token
              await fetchUser()
              toast.success(`${provider === 'google' ? 'Google' : 'Apple'} ile giriş başarılı!`)
              // Wait a bit for state to update
              setTimeout(() => {
                let returnTo = searchParams.get('returnTo')
                if (!returnTo && typeof window !== 'undefined') {
                  returnTo = sessionStorage.getItem('oauth_return_to')
                  if (returnTo) {
                    sessionStorage.removeItem('oauth_return_to')
                  }
                }
                router.push(returnTo || '/')
              }, 500)
            } else {
              throw new Error('Kullanıcı bilgileri alınamadı')
            }
          } else {
            throw new Error('Kullanıcı bilgileri alınamadı')
          }
        } catch (error: any) {
          console.error('Fetch user error:', error)
          toast.error('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.')
          router.push('/auth/login')
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error)
        toast.error('Giriş işlemi başarısız. Lütfen tekrar deneyin.')
        router.push('/auth/login')
      } finally {
        setIsProcessing(false)
      }
    }

    processCallback()
  }, [searchParams, router, setUser, fetchUser])

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <MeshBackground />
      <Card className="w-full max-w-md mx-4 z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Giriş Yapılıyor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isProcessing ? (
            <>
              <Icons.spinner className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground text-center">
                Hesabınıza giriş yapılıyor, lütfen bekleyin...
              </p>
            </>
          ) : (
            <>
              <Check className="h-8 w-8 text-green-500 mb-4" />
              <p className="text-muted-foreground text-center">
                Yönlendiriliyorsunuz...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

