#!/bin/bash

# Docker Build Sorunlarını Düzeltme Script'i

set -e

echo "🔧 Docker build sorunlarını düzeltiyorum..."

echo ""
echo "1️⃣  Docker cache'i temizliyorum..."
docker builder prune -af
docker buildx prune -af

echo ""
echo "2️⃣  Kullanılmayan Docker kaynaklarını temizliyorum..."
docker system prune -af --volumes

echo ""
echo "3️⃣  Docker Compose servislerini durduruyorum..."
docker-compose down -v 2>/dev/null || true

echo ""
echo "4️⃣  Dockerfile'ı optimize ettim (apt-get lock sorunları için)"

echo ""
echo "5️⃣  Build'i temiz cache ile başlatıyorum..."
DOCKER_BUILDKIT=1 docker-compose build --no-cache backend

echo ""
echo "✅ Tamamlandı! Şimdi şunları deneyebilirsiniz:"
echo "   docker-compose up -d"
echo ""
echo "⚠️  Eğer hala sorun varsa:"
echo "   1. Docker Desktop'u restart edin"
echo "   2. Disk alanını kontrol edin"
echo "   3. DOCKER_TROUBLESHOOTING.md dosyasına bakın"

