import api from '@/lib/api'


export const login = async (data: { email: string; password: string }) => {
  await api.get('/sanctum/csrf-cookie')
  const response = await api.post('/api/login', data)
  return response.data
}

export const register = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
  await api.get('/sanctum/csrf-cookie')
  const response = await api.post('/api/register', data)
  return response.data
}


