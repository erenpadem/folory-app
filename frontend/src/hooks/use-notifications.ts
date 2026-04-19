import { useQuery } from '@tanstack/react-query'
import api from '@/shared/lib/api-client'
import { useAuth } from '@/features/auth'

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/notifications/unread-count')
        // Backend returns: { success: true, data: { count: number } }
        return response.data?.data?.count || 0
      } catch (error) {
        // If unauthorized or error, return 0
        return 0
      }
    },
    enabled: isAuthenticated, // Only fetch if authenticated
    refetchInterval: isAuthenticated ? 30000 : false, // Refetch every 30 seconds if authenticated
    retry: false, // Don't retry on error
  })

  return {
    unreadCount: unreadCount || 0,
  }
}

