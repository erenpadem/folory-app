#!/bin/bash

# Docker Build Test Script
# Hataları detaylı görmek için kullanın

set -e

echo "🔍 Docker build test ediliyor..."
echo ""

echo "1️⃣  Backend Dockerfile syntax kontrolü..."
cd backend

# Build'i verbose modda çalıştır
echo ""
echo "2️⃣  Build başlatılıyor (detaylı log)..."
echo ""

DOCKER_BUILDKIT=1 docker build \
    --progress=plain \
    --no-cache \
    -f docker/development/workspace/Dockerfile \
    -t test-backend:latest \
    . 2>&1 | tee /tmp/docker-build.log

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build başarılı!"
else
    echo ""
    echo "❌ Build başarısız! Log dosyası: /tmp/docker-build.log"
    echo ""
    echo "📋 Son 50 satır:"
    tail -50 /tmp/docker-build.log
    exit 1
fi

