import api from '@/shared/lib/api-client'

export interface User {
  id: number
  name: string
  username?: string
  email: string
  avatar?: string
  cover_image?: string
  bio?: string
  role?: string
  is_verified?: boolean
  created_at?: string
  updated_at?: string
  books_total_count?: number
  books_published_count?: number
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const response = await api.get(`/api/users/username/${username}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const response = await api.get(`/api/users/${id}`)
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error('Error fetching user by id:', error)
    return null
  }
}

export interface UpdateProfilePayload {
  name?: string
  username?: string
  bio?: string
  avatar?: string | null
  cover_image?: string | null
  phone?: string | null
}

export async function requestEmailChange(payload: {
  password: string
  new_email: string
}) {
  const response = await api.post<{ success: boolean; message?: string }>(
    '/api/user/change-email/request',
    payload
  )
  return response.data
}

export async function confirmEmailChange(payload: { new_email: string; code: string }) {
  const response = await api.post<{
    success: boolean
    message?: string
    data?: { user: User }
    errors?: Record<string, string[]>
  }>('/api/user/change-email/confirm', payload)
  return response.data
}

export async function updateUserProfile(payload: UpdateProfilePayload) {
  const response = await api.put<{
    success: boolean
    message?: string
    errors?: Record<string, string[]>
    data?: { user: User }
  }>('/api/user/profile', payload)
  return response.data
}

export async function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}) {
  const response = await api.post<{ success: boolean; message?: string }>(
    '/api/user/change-password',
    payload
  )
  return response.data
}

export async function sendPasswordResetToEmail() {
  const response = await api.post<{ success: boolean; message?: string }>(
    '/api/user/send-password-reset'
  )
  return response.data
}

export async function deactivateAccount(payload: { password: string; acknowledge: boolean }) {
  const response = await api.post<{ success: boolean; message?: string }>(
    '/api/user/deactivate',
    payload
  )
  return response.data
}

export async function deleteAccount(payload: { password: string; acknowledge: boolean }) {
  const response = await api.delete<{ success: boolean; message?: string }>('/api/user/account', {
    data: payload,
  })
  return response.data
}

export async function requestPasswordResetCode(email: string) {
  const response = await api.post<{ success: boolean; message?: string }>('/api/forgot-password', {
    email,
  })
  return response.data
}

export async function resetPasswordWithCode(payload: {
  email: string
  code: string
  password: string
  password_confirmation: string
}) {
  const response = await api.post<{ success: boolean; message?: string }>('/api/reset-password', payload)
  return response.data
}

