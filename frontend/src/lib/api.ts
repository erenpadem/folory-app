import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.seninprojen.com', 
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (örneğin token eklemek için)
api.interceptors.request.use(config => {
  // const token = localStorage.getItem('token')
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - hata yakalama ve yönetme
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Backend hata döndürdü
      const status = error.response.status
      switch (status) {
        case 400:
          console.error('Hatalı istek')
          break
        case 401:
          console.error('Yetkisiz erişim - giriş yapmanız gerekiyor')
          break
        case 500:
          console.error('Sunucu hatası, daha sonra tekrar deneyin')
          break
        default:
          console.error('Bilinmeyen hata:', error.response.data)
      }
    } else if (error.request) {
      // Sunucuya ulaşılamadı
      console.error('Sunucuya ulaşılamıyor, internet bağlantını kontrol et')
    } else {
      console.error('İstek oluşturulurken hata:', error.message)
    }
    // Hata detayını çağıran yere ilet
    return Promise.reject(error)
  }
)

export default api
