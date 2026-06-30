#!/usr/bin/env bash
# First-time server bootstrap: infra + blue slot + edge nginx.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$DEPLOY_DIR"

if [[ ! -f .env ]]; then
    echo "Copy deploy/.env.example to deploy/.env and fill in values first." >&2
    exit 1
fi

# shellcheck disable=SC1091
source .env

IMAGE_TAG="${1:-${BLUE_TAG:-latest}}"

if [[ -n "${GHCR_TOKEN:-}" ]]; then
    echo "$GHCR_TOKEN" | docker login "${REGISTRY:-ghcr.io}" -u "${GHCR_USERNAME:-github}" --password-stdin
fi

export BLUE_TAG="$IMAGE_TAG"
export GREEN_TAG="${GREEN_TAG:-$IMAGE_TAG}"
export WORKER_TAG="$IMAGE_TAG"

echo "Pulling images (tag: ${IMAGE_TAG})..."
docker compose pull postgres redis worker scheduler
docker compose --profile blue pull api-blue frontend-blue

echo "Starting infrastructure..."
docker compose up -d postgres redis

echo "Waiting for postgres..."
sleep 5

echo "Starting blue slot, worker, scheduler, edge..."
docker compose --profile blue up -d api-blue frontend-blue worker scheduler edge

echo "Running initial migrations..."
docker compose --profile blue exec -T api-blue php artisan migrate --force --no-interaction

echo "blue" > .active-slot
cp nginx/upstreams/blue.conf nginx/upstreams/active.conf

echo "Bootstrap complete. App should be reachable at http://${HTTP_BIND:-127.0.0.1}:${HTTP_PORT:-8082}"
