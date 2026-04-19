'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '../icons'
import { Separator } from "@/components/ui/separator"
import { useState } from 'react'
import { getCurrentReturnTo } from '@/lib/auth-redirect'

interface AuthSocialProps {
  loading?: boolean
}

export function AuthSocial({ loading }: AuthSocialProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('oauth_return_to', getCurrentReturnTo())
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'
      window.location.href = `${apiUrl}/api/auth/${provider}`
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Veya şununla devam et
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => handleOAuthLogin('google')}
          disabled={loading || isLoading}
        >
          <Icons.google className="h-4 w-4 mr-2" />
          Google
        </Button>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => handleOAuthLogin('apple')}
          disabled={loading || isLoading}
        >
          <Icons.apple className="h-4 w-4 mr-2" />
          Apple
        </Button>
      </div>
    </div>
  )
}