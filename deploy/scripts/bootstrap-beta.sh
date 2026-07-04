#!/usr/bin/env bash
# Beta ortamı: tek api + tek frontend + edge (8083). Prod blue-green'den bağımsız.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f docker-compose.beta.yml --env-file .env.beta"

cd "$DEPLOY_DIR"

if [[ ! -f .env.beta ]]; then
    echo "Önce: cp .env.beta.example .env.beta && APP_KEY, DB_PASSWORD, GHCR_TOKEN doldur" >&2
    exit 1
fi

# shellcheck disable=SC1091
source .env.beta

TAG="${1:-${BETA_TAG:-latest}}"

if [[ -n "${GHCR_TOKEN:-}" ]]; then
    echo "$GHCR_TOKEN" | docker login "${REGISTRY:-ghcr.io}" -u "${GHCR_USERNAME:-github}" --password-stdin
fi

export BETA_TAG="$TAG"

echo "Beta pull (tag: ${TAG})..."
$COMPOSE pull postgres redis api frontend worker

echo "Beta başlatılıyor..."
$COMPOSE up -d postgres redis
sleep 5
$COMPOSE up -d api frontend worker edge

echo ""
echo "Beta hazır: http://${HTTP_BIND:-127.0.0.1}:${HTTP_PORT:-8083}"
echo "Host nginx: beta.fo-lory.com → 127.0.0.1:${HTTP_PORT:-8083} (deploy/nginx/host-beta.fo-lory.com.conf.example)"
echo "Test: curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:${HTTP_PORT:-8083}/up"
