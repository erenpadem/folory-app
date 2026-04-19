# Docker Build Sorun Giderme Rehberi

## 🔴 Hata: dpkg lock-frontend I/O Error

Bu hata genellikle şu sebeplerden kaynaklanır:
1. Docker BuildKit cache bozulmuş
2. Paralel build'ler çakışıyor
3. Docker Desktop disk alanı sorunu
4. BuildKit metadata dosyası bozulmuş

## ✅ Çözümler

### 1. Docker Build Cache'i Temizle

```bash
# Tüm build cache'i temizle
docker builder prune -af

# BuildKit'i resetle
docker buildx prune -af

# Docker Desktop'u restart et
```

### 2. Docker Desktop Disk Alanını Kontrol Et

```bash
# Docker Desktop ayarlarından disk kullanımını kontrol et
# Settings > Resources > Advanced > Disk image size
```

### 3. Build'i Temiz Cache ile Çalıştır

```bash
# Backend için
cd backend
docker-compose build --no-cache workspace

# Veya root dizinde
docker-compose build --no-cache backend
```

### 4. BuildKit'i Devre Dışı Bırak (Geçici)

Eğer sorun devam ederse, BuildKit'i devre dışı bırakabilirsiniz:

```bash
# BuildKit'i devre dışı bırak
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# Sonra build et
docker-compose build backend
```

### 5. Tek Adımda Build Et

```bash
# Tüm servisleri temizleyip yeniden build et
docker-compose down -v
docker system prune -af
docker-compose build --no-cache
docker-compose up -d
```

### 6. Disk Alanı Temizle

```bash
# Kullanılmayan Docker kaynaklarını temizle
docker system df
docker system prune -a --volumes

# Eski container'ları sil
docker container prune -f

# Eski image'ları sil
docker image prune -a -f

# Eski volume'ları sil
docker volume prune -f

# Eski network'leri sil
docker network prune -f
```

## 🛠️ Dockerfile Optimizasyonları

Dockerfile'da yapılan iyileştirmeler:

1. **set -eux**: Hatalarda durur ve verbose output
2. **DEBIAN_FRONTEND=noninteractive**: Interactive prompt'ları engeller
3. **--no-install-recommends**: Gereksiz paketleri yüklemez
4. **rm -rf /tmp/* ve /var/tmp/***: Geçici dosyaları temizler

## 📝 Manuel Lock Dosyası Temizleme (Son Çare)

Eğer yukarıdakiler işe yaramazsa:

```bash
# Container içinde lock dosyasını temizle (eğer çalışıyorsa)
docker exec -it <container_name> rm -f /var/lib/dpkg/lock-frontend
docker exec -it <container_name> rm -f /var/lib/dpkg/lock
docker exec -it <container_name> rm -f /var/cache/apt/archives/lock
docker exec -it <container_name> rm -f /var/cache/apt/archives/lock-frontend

# Container'ı restart et
docker restart <container_name>
```

## 🚀 Hızlı Çözüm

En hızlı çözüm genellikle şudur:

```bash
# 1. Docker Desktop'u kapat
# 2. Terminal'de:
docker system prune -af --volumes
docker builder prune -af

# 3. Docker Desktop'u aç
# 4. Build'i tekrar dene:
docker-compose build --no-cache backend
```

## 🔍 Sorun Devam Ederse

1. **Docker Desktop Versiyonunu Kontrol Et**: Güncel sürümü kullanın
2. **Disk Alanını Kontrol Et**: En az 10GB boş alan olmalı
3. **Logları İncele**: `docker-compose logs backend` ile hata detaylarını görün
4. **ARM64 Sorunu**: Apple Silicon Mac'te bazı image'lar sorun çıkarabilir

## 🔴 Hata: Frontend node_modules chmod I/O Error

### Hata Mesajı
```
failed to chmod on /var/lib/docker/overlay2/.../node_modules/has-symbols/test/shams: 
chmod /app/node_modules/has-symbols/test/shams: input/output error
```

### Neden Olur?
1. Docker overlay2 filesystem I/O hatası
2. node_modules volume mount sorunu
3. Docker Desktop metadata corruption
4. Çok fazla dosya (node_modules binlerce dosya içerir)

### ✅ Çözümler

#### 1. Docker Desktop'u Restart Et
```bash
# Docker Desktop'u kapat
osascript -e 'quit app "Docker"'

# 15-20 saniye bekle

# Docker Desktop'u aç
```

#### 2. Frontend node_modules'u Temizle
```bash
cd frontend
rm -rf node_modules .next .turbo
cd ..
```

#### 3. Dockerfile'ı Optimize Et
```dockerfile
# Development
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --prefer-offline --no-audit
COPY . .
RUN chown -R node:node /app && chmod -R 755 /app
USER node
CMD ["npm", "run", "dev"]
```

#### 4. .dockerignore Ekleyin
`.dockerignore` dosyası oluşturun:
```
node_modules
.next
.git
.env
*.log
```

#### 5. Volume Mount Stratejisi
docker-compose.yml'de:
```yaml
volumes:
  - ./frontend:/app
  - /app/node_modules  # Named volume yerine anonymous
  - frontend_node_modules:/app/node_modules  # Named volume kullan
```

#### 6. Build Cache'i Temizle
```bash
docker builder prune -af
docker system prune -af --volumes
```

## 🔴 Hata: apt-get install Exit Code 100

### Hata Mesajı
```
process "/bin/sh -c set -eux; apt-get install..." did not complete successfully: exit code: 100
```

### Neden Olur?
1. Paket adı bulunamaz (eski paket isimleri)
2. Bağımlılık çözümleme hatası
3. Mirror/repository hatası
4. Debian versiyon uyumsuzluğu

### ✅ Çözümler

#### 1. Paket İsimlerini Güncelle
`libjpeg62-turbo-dev` → `libjpeg-dev` (yeni Debian versiyonlarında)

#### 2. Build'i Detaylı Log ile Çalıştır
```bash
./test-docker-build.sh

# Veya manuel:
DOCKER_BUILDKIT=1 docker-compose build --progress=plain --no-cache backend
```

#### 3. Dockerfile'ı Optimize Et
```dockerfile
# Her paketi ayrı satırda yazın (okunabilirlik için)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    ...
```

#### 4. Paket Bulunamazsa Alternatif Kontrol Et
```bash
# Container içinde paketleri kontrol et
docker run --rm php:8.2-fpm bash -c "apt-get update && apt-cache search libjpeg"
```

#### 5. Base Image Versiyonunu Kontrol Et
```dockerfile
# Belirli Debian versiyonu kullan
FROM php:8.2-fpm-bookworm

# veya
FROM php:8.2-fpm-bullseye
```

## 🔴 Hata: containerd metadata I/O Error

### Hata Mesajı
```
Error response from daemon: error creating temporary lease: 
write /var/lib/desktop-containerd/daemon/io.containerd.metadata.v1.bolt/meta.db: 
input/output error
```

### Neden Olur?
Docker Desktop'un iç metadata veritabanı bozulmuştur. Bu genellikle:
1. Docker Desktop'un ani kapanması
2. Disk I/O hataları
3. Metadata database corruption
4. Disk alanı dolması

### ✅ Çözümler

#### 1. Docker Desktop'u Restart Et (Hızlı Çözüm)
```bash
# Docker Desktop'u kapat
# Apple menüden: Docker Desktop > Quit Docker Desktop

# 10-15 saniye bekleyin

# Docker Desktop'u tekrar açın
```

#### 2. Docker Desktop'u Resetle (Orta Seviye)
```
1. Docker Desktop'u aç
2. Settings (⚙️) > Troubleshoot
3. "Clean / Purge data" butonuna tıkla
4. Docker Desktop otomatik restart olacak
```

#### 3. Factory Reset (Son Çare)
```
1. Docker Desktop'u aç
2. Settings (⚙️) > Troubleshoot
3. "Reset to factory defaults" butonuna tıkla
4. Tüm veriler silinecek, yeni kurulum yapılacak
```

#### 4. Manuel Temizlik (İleri Seviye)
```bash
# Script'i çalıştır
./fix-docker-containerd.sh

# Veya manuel:
# Tüm container'ları durdur
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Sistem temizliği
docker system prune -af --volumes

# Docker Desktop'u restart et
```

#### 5. Disk Alanını Kontrol Et
```bash
# Disk kullanımını kontrol et
df -h

# Docker disk kullanımını kontrol et
docker system df

# Docker Desktop ayarlarından disk kullanımını kontrol et
# Settings > Resources > Advanced > Disk image size
```

### 🚀 Hızlı Çözüm Script'i
```bash
# Script'i çalıştır
chmod +x fix-docker-containerd.sh
./fix-docker-containerd.sh
```

### ⚠️ Önemli Notlar
1. **Data Kaybı**: Factory reset tüm Docker data'nızı siler
2. **Volume'lar**: Reset yapmadan önce önemli volume'ları yedekleyin
3. **Images**: Custom image'larınız kaybolabilir
4. **Network**: Docker network'leri sıfırlanabilir

### 🔍 Sorun Devam Ederse
1. **Mac Disk İzinlerini Kontrol Et**: Disk erişim izinlerini kontrol edin
2. **Docker Desktop Versiyonunu Güncelle**: En son versiyonu kullanın
3. **MacOS'u Restart Et**: Bazen sistem seviyesinde restart gerekir
4. **Disk Alanı**: En az 20GB boş alan olmalı

## 📞 Ek Yardım

```bash
# Build loglarını detaylı görüntüle
docker-compose build --progress=plain backend

# Docker info
docker info

# BuildKit durumu
docker buildx ls
docker buildx du

# Containerd durumu (Docker Desktop içinde)
docker system events &
```

