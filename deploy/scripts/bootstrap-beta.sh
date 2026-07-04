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
read_env() {
    local key="$1"
    local default="${2:-}"
    local line
    line="$(grep -E "^${key}=" .env.beta 2>/dev/null | head -1 || true)"
    if [[ -z "$line" ]]; then
        echo "$default"
        return
    fi
    local val="${line#*=}"
    val="${val%\"}"
    val="${val#\"}"
    val="${val%\'}"
    val="${val#\'}"
    echo "$val"
}

TAG="${1:-$(read_env BETA_TAG latest)}"
REGISTRY="$(read_env REGISTRY ghcr.io)"
GHCR_USERNAME="$(read_env GHCR_USERNAME github)"
GHCR_TOKEN="$(read_env GHCR_TOKEN)"
HTTP_BIND="$(read_env HTTP_BIND 127.0.0.1)"
HTTP_PORT="$(read_env HTTP_PORT 8083)"

if [[ -n "$GHCR_TOKEN" ]]; then
    echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "$GHCR_USERNAME" --password-stdin
fi

export BETA_TAG="$TAG"

pull_beta_images() {
    $COMPOSE pull postgres redis api frontend worker
}

echo "Beta pull (tag: ${TAG})..."
if ! pull_beta_images; then
    if [[ "$TAG" != "latest" ]]; then
        echo "Tag ${TAG} GHCR'da yok — latest ile deneniyor." >&2
        echo "Kalıcı çözüm: GitHub Actions → Build Beta → Run workflow" >&2
        TAG="latest"
        export BETA_TAG="$TAG"
        pull_beta_images
    else
        exit 1
    fi
fi

echo "Beta başlatılıyor..."
$COMPOSE up -d postgres redis
sleep 5
$COMPOSE up -d api frontend worker edge

echo ""
echo "Beta hazır: http://${HTTP_BIND}:${HTTP_PORT}"
echo "Host nginx: beta.fo-lory.com → 127.0.0.1:${HTTP_PORT} (deploy/nginx/host-beta.fo-lory.com.conf.example)"
echo "Test: curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:${HTTP_PORT}/up"
