#!/bin/bash

# Docker Desktop Containerd Metadata Hatası Düzeltme Script'i

set -e

echo "🔧 Docker Desktop containerd metadata hatasını düzeltiyorum..."
echo ""

echo "⚠️  Bu script Docker Desktop'u resetleyecektir!"
echo "   Devam etmek istiyor musunuz? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "İptal edildi."
    exit 0
fi

echo ""
echo "1️⃣  Docker Compose servislerini durduruyorum..."
docker-compose down -v 2>/dev/null || true

echo ""
echo "2️⃣  Tüm container'ları durduruyorum..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

echo ""
echo "3️⃣  Docker sistem kaynaklarını temizliyorum..."
docker system prune -af --volumes 2>/dev/null || true

echo ""
echo "4️⃣  Docker build cache'i temizliyorum..."
docker builder prune -af 2>/dev/null || true
docker buildx prune -af 2>/dev/null || true

echo ""
echo "5️⃣  Docker Desktop'u yeniden başlatmanız gerekiyor!"
echo ""
echo "   🔄 Adımlar:"
echo "   1. Docker Desktop'u kapatın (Quit Docker Desktop)"
echo "   2. 10 saniye bekleyin"
echo "   3. Docker Desktop'u tekrar açın"
echo ""
echo "   ⚠️  Eğer sorun devam ederse:"
echo "   1. Docker Desktop > Settings > Troubleshoot > Clean / Purge data"
echo "   2. Veya: Docker Desktop > Reset to factory defaults"
echo ""

echo "6️⃣  Docker Desktop yeniden başladıktan sonra:"
echo "   docker-compose up -d"
echo ""

