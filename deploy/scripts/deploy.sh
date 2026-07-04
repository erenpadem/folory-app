#!/usr/bin/env bash
# Zero-downtime deploy: pull GHCR images, start inactive slot, migrate, switch traffic, drain old slot.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$DEPLOY_DIR"

if [[ ! -f .env ]]; then
    echo "Missing deploy/.env — copy .env.example and configure it." >&2
    exit 1
fi

# shellcheck disable=SC1091
source .env

IMAGE_TAG="${1:-${IMAGE_TAG:-latest}}"
REGISTRY="${REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-folory}"

if [[ -n "${GHCR_TOKEN:-}" ]]; then
    echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "${GHCR_USERNAME:-${GITHUB_ACTOR:-github}}" --password-stdin
fi

ACTIVE_SLOT="blue"
if [[ -f .active-slot ]]; then
    ACTIVE_SLOT="$(tr -d '[:space:]' < .active-slot)"
fi

if [[ "$ACTIVE_SLOT" == "blue" ]]; then
    INACTIVE_SLOT="green"
else
    INACTIVE_SLOT="blue"
fi

echo "Active slot: ${ACTIVE_SLOT} → deploying to inactive slot: ${INACTIVE_SLOT} (tag: ${IMAGE_TAG})"

export REGISTRY IMAGE_NAME

if [[ "$INACTIVE_SLOT" == "blue" ]]; then
    export BLUE_TAG="$IMAGE_TAG"
    export GREEN_TAG="${GREEN_TAG:-latest}"
else
    export GREEN_TAG="$IMAGE_TAG"
    export BLUE_TAG="${BLUE_TAG:-latest}"
fi

export WORKER_TAG="$IMAGE_TAG"

pull_slot_images() {
    docker compose --profile "$INACTIVE_SLOT" pull "api-${INACTIVE_SLOT}" "frontend-${INACTIVE_SLOT}"
    docker compose pull worker scheduler
}

echo "Pulling images..."
if ! pull_slot_images; then
    if [[ "$IMAGE_TAG" != "latest" ]]; then
        echo "Tag ${IMAGE_TAG} not found on GHCR — falling back to latest." >&2
        IMAGE_TAG="latest"
        if [[ "$INACTIVE_SLOT" == "blue" ]]; then
            export BLUE_TAG="$IMAGE_TAG"
        else
            export GREEN_TAG="$IMAGE_TAG"
        fi
        export WORKER_TAG="$IMAGE_TAG"
        pull_slot_images
    else
        exit 1
    fi
fi

echo "Starting shared infrastructure (if not running)..."
docker compose up -d postgres redis

echo "Starting inactive slot: ${INACTIVE_SLOT}..."
docker compose --profile "$INACTIVE_SLOT" up -d "api-${INACTIVE_SLOT}" "frontend-${INACTIVE_SLOT}"

echo "Running migrations on inactive slot..."
docker compose --profile "$INACTIVE_SLOT" exec -T "api-${INACTIVE_SLOT}" php artisan migrate --force --no-interaction

echo "Health checking inactive slot..."
"$SCRIPT_DIR/health-check.sh" "$INACTIVE_SLOT"

echo "Ensuring edge nginx is running..."
cp "nginx/upstreams/${INACTIVE_SLOT}.conf" "nginx/upstreams/active.conf"
docker compose up -d edge

echo "Switching traffic to ${INACTIVE_SLOT}..."
"$SCRIPT_DIR/switch-slot.sh" "$INACTIVE_SLOT"

echo "Updating worker and scheduler..."
docker compose up -d worker scheduler

if [[ "$INACTIVE_SLOT" == "blue" ]]; then
    export BLUE_TAG="$IMAGE_TAG"
else
    export GREEN_TAG="$IMAGE_TAG"
fi

# Persist tag for the inactive slot that is now active
if grep -q "^BLUE_TAG=" .env 2>/dev/null; then
    if [[ "$INACTIVE_SLOT" == "blue" ]]; then
        sed -i.bak "s/^BLUE_TAG=.*/BLUE_TAG=${IMAGE_TAG}/" .env
    else
        sed -i.bak "s/^GREEN_TAG=.*/GREEN_TAG=${IMAGE_TAG}/" .env
    fi
    rm -f .env.bak
fi

SOAK_SECONDS="${DRAIN_SOAK_SECONDS:-30}"
echo "Soaking ${SOAK_SECONDS}s before stopping old slot (${ACTIVE_SLOT})..."
sleep "$SOAK_SECONDS"

echo "Stopping old slot: ${ACTIVE_SLOT}..."
docker compose --profile "$ACTIVE_SLOT" stop "api-${ACTIVE_SLOT}" "frontend-${ACTIVE_SLOT}" || true

echo "Deploy complete. Active slot: ${INACTIVE_SLOT}, image tag: ${IMAGE_TAG}"
