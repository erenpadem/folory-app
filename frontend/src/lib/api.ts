import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
})

api.interceptors.response.use(
  response => response,
  error => {
    const { response, request, message } = error

    if (response) {
      const status = response.status
      const messageFromServer = response.data?.message

      switch (status) {
        case 400:
          toast.error(messageFromServer || 'Hatalı istek')
          break
        case 401:
          toast.error(messageFromServer || 'Yetkisiz erişim – lütfen giriş yapın')
          break
        case 403:
          toast.error('Erişim engellendi')
          break
        case 404:
          toast.error('İstek yapılan veri bulunamadı')
          break
        case 422:
        const rawErrors = response.data?.errors
  if (rawErrors && typeof rawErrors === 'object') {
    const errors = rawErrors as Record<string, string[]>
    const firstError = Object.values(errors)[0]?.[0]
    toast.error(firstError || 'Doğrulama hatası')
  } else {
    toast.error('Doğrulama hatası')
  }
          break
        case 500:
          toast.error('Sunucu hatası – daha sonra tekrar deneyin')
          break
        default:
          toast.error(messageFromServer || 'Bilinmeyen bir hata oluştu')
      }
    } else if (request) {
      toast.error('Sunucuya ulaşılamıyor – internet bağlantınızı kontrol edin')
    } else {
      toast.error(`İstek hatası: ${message}`)
    }

    return Promise.reject(error)
  }
)

export default api
