import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (gerekirse token eklenebilir)
api.interceptors.request.use(config => {
  // const token = localStorage.getItem('token')
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - toast ile hata bildirimleri
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400:
          toast.error('Hatalı istek')
          break
        case 401:
          toast.error('Yetkisiz erişim – lütfen giriş yapın')
          break
        case 403:
          toast.error('Erişim engellendi')
          break
        case 404:
          toast.error('İstek yapılan veri bulunamadı')
          break
        case 422:
          toast.error('Doğrulama hatası')
          break
        case 500:
          toast.error('Sunucu hatası – daha sonra tekrar deneyin')
          break
        default:
          toast.error('Bilinmeyen bir hata oluştu')
      }
    } else if (error.request) {
      toast.error('Sunucuya ulaşılamıyor – internet bağlantınızı kontrol edin')
    } else {
      toast.error(`İstek hatası: ${error.message}`)
    }

    return Promise.reject(error)
  }
)

export default api
