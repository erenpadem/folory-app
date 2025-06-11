'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

type User = {
  id: number
  name: string
  email: string
  username?: string
  avatar?: string
}


interface AuthContextType {
  user: User | null
  loading: boolean
  login: (data: { email: string; password: string }) => Promise<void>
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/api/user')
      // Eğer data.user varsa al, yoksa direkt data al
      setUser(data.user ?? data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (data: { email: string; password: string }) => {
    setLoading(true)
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/login', data)
      await fetchUser()
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
    await api.get('/sanctum/csrf-cookie')
    await api.post('/api/register', data)
    await fetchUser()
    router.push('/')
  }

  const logout = async () => {
    await api.post('/api/logout')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
