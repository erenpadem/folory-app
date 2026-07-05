'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth'
import api from '@/shared/lib/api-client'
import { useRouter } from 'next/navigation'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  userId: number
  className?: string
}

export function FollowButton({ userId, className }: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const isSelf = user?.id != null && Number(user.id) === userId

  useEffect(() => {
    if (!isAuthenticated || isSelf) {
      setLoading(false)
      setIsFollowing(false)
      return
    }
    void api
      .get(`/api/follows/check/${userId}`)
      .then((res) => setIsFollowing(Boolean(res.data?.is_following)))
      .catch(() => setIsFollowing(false))
      .finally(() => setLoading(false))
  }, [userId, isAuthenticated, isSelf])

  if (isSelf) return null

  const toggle = async () => {
    if (!isAuthenticated) {
      router.push(buildLoginUrl({ returnTo: getCurrentReturnTo(), tab: 'register' }))
      return
    }
    if (busy) return
    try {
      setBusy(true)
      if (isFollowing) {
        await api.delete(`/api/follows/${userId}`)
        setIsFollowing(false)
        toast.success('Takibi bıraktınız')
      } else {
        await api.post('/api/follows', { following_id: userId })
        setIsFollowing(true)
        toast.success('Yazar takip edildi')
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'İşlem başarısız'
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Yükleniyor...
      </Button>
    )
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      className={className}
      onClick={() => void toggle()}
      disabled={busy}
    >
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
    </Button>
  )
}
