#!/bin/bash

# Tüm Docker I/O Sorunlarını Düzeltme Script'i

set -e

echo "🔧 Docker tüm I/O sorunlarını düzeltiyorum..."
echo ""

echo "⚠️  Bu script Docker Desktop'u resetleyecek!"
echo "   Devam etmek istiyor musunuz? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "İptal edildi."
    exit 0
fi

echo ""
echo "1️⃣  Tüm Docker Compose servislerini durduruyorum..."
docker-compose down -v 2>/dev/null || true

echo ""
echo "2️⃣  Tüm container'ları durduruyorum ve siliyorum..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

echo ""
echo "3️⃣  Tüm Docker sistem kaynaklarını temizliyorum..."
docker system prune -af --volumes 2>/dev/null || true

echo ""
echo "4️⃣  Docker build cache'i temizliyorum..."
docker builder prune -af 2>/dev/null || true
docker buildx prune -af 2>/dev/null || true

echo ""
echo "5️⃣  Frontend node_modules'u temizliyorum..."
rm -rf frontend/node_modules frontend/.next frontend/.turbo 2>/dev/null || true

echo ""
echo "6️⃣  Docker volume'larını temizliyorum..."
docker volume prune -f 2>/dev/null || true

echo ""
echo "7️⃣  Docker network'leri temizliyorum..."
docker network prune -f 2>/dev/null || true

echo ""
echo "8️⃣  Docker images'ları temizliyorum..."
docker image prune -af 2>/dev/null || true

echo ""
echo "✅ Temizlik tamamlandı!"
echo ""
echo "🔄 ŞİMDİ YAPMANIZ GEREKENLER:"
echo ""
echo "   1. Docker Desktop'u kapatın:"
echo "      - Docker Desktop menüsünden 'Quit Docker Desktop'"
echo "      - VEYA terminal'de: osascript -e 'quit app \"Docker\"'"
echo ""
echo "   2. 15-20 saniye bekleyin"
echo ""
echo "   3. Docker Desktop'u tekrar açın"
echo ""
echo "   4. Docker Desktop açıldıktan sonra:"
echo "      docker-compose up -d --build"
echo ""
echo "⚠️  Eğer sorun devam ederse:"
echo "   1. Docker Desktop > Settings > Troubleshoot"
echo "   2. 'Clean / Purge data' butonuna tıklayın"
echo "   3. VEYA 'Reset to factory defaults' (tüm veriler silinir!)"
echo ""

