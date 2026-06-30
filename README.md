# Fo-lory - Modern Hikaye Platformu (Monolitik Versiyon)

![Fo-lory Logo](/next-frontend/public/assets/logo.png)

**Fo-lory**, yazarlar ve okuyucular için tasarlanmış modern bir hikaye paylaşım platformudur.

## Proje Linki
[https://github.com/erenpadem/folory-app](https://github.com/erenpadem/folory-app)

## Özellikler

- 📖 Çok çeşitli kategorilerde hikayeler
- ✍️ Kolay hikaye oluşturma ve yayınlama
- 🔍 Gelişmiş arama ve filtreleme seçenekleri
- ❤️ Beğeni ve yorum sistemi
- 🔐 JWT tabanlı kimlik doğrulama
- 📱 Tamamen duyarlı (responsive) tasarım
- ⚡ Next.js ile yüksek performanslı frontend
- 🚀 Laravel ile güçlü backend

## Proje Yapısı

```
folory-app/
├── frontend/       # Next.js uygulaması
├── backend/        # Laravel uygulaması
├── docker/         # Docker konfigürasyonları
├── .env            # Ortam değişkenleri
└── README.md       # Bu dosya
```

## Teknoloji Yığını

### Frontend (Next.js)
- **Framework**: Next.js (App Router)
- **UI Kütüphanesi**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form

### Backend (Laravel)
- **Framework**: Laravel 10
- **Authentication**: Laravel Sanctum
- **API**: RESTful API
- **Database**: PostgreSQL

## Kurulum

### 1. Gereksinimler
- Docker ve Docker Compose
- Node.js 18+
- PHP 8.2+
- Composer

### 2. Projeyi Klonlama
```bash
git clone https://github.com/erenpadem/folory-app.git
cd folory-app
```

### 3. Backend Kurulumu
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 4. Frontend Kurulumu
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

### 5. Docker ile Çalıştırma
```bash
docker-compose up -d
```

### 6. Veritabanı Migrasyonları
```bash
docker-compose exec backend php artisan migrate --seed
```

### 7. Uygulamayı Başlatma
```bash
# Backend (http://localhost:8081)
docker-compose exec backend php artisan serve --host=0.0.0.0

# Frontend (http://localhost:3000)
cd frontend
npm run dev
```

## Ortam Değişkenleri

`.env` dosyası örneği:

```env
# Laravel
APP_NAME=Fo-lory
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8081

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=folory
DB_USERNAME=root
DB_PASSWORD=secret

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_SITE_NAME=Fo-lory
```

## Geliştirme

### Backend Geliştirme
```bash
cd backend
php artisan serve
```

### Frontend Geliştirme
```bash
cd frontend
npm run dev
```

### Test Çalıştırma
```bash
# Backend testleri
cd backend
php artisan test

# Frontend testleri
cd frontend
npm run test
```

## Lisans

Bu proje [MIT lisansı](LICENSE) ile lisanslanmıştır.

## İletişim

Proje sahibi: Eren Padem  
GitHub: [@erenpadem](https://github.com/erenpadem)  
Email: erenpadem@gmail.com

---

**Fo-lory** - Hayal gücünüzün sınırlarını keşfedin. ✨
