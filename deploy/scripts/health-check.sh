#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SLOT="${1:-blue}"
API_CONTAINER="folory-api-${SLOT}"
FRONTEND_CONTAINER="folory-frontend-${SLOT}"

MAX_ATTEMPTS="${HEALTH_CHECK_ATTEMPTS:-30}"
SLEEP_SECONDS="${HEALTH_CHECK_INTERVAL:-5}"

check_container() {
    local name="$1"
    local attempt=1

    while (( attempt <= MAX_ATTEMPTS )); do
        if docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null | grep -q healthy; then
            echo "${name} is healthy."
            return 0
        fi

        echo "Waiting for ${name} (${attempt}/${MAX_ATTEMPTS})..."
        sleep "$SLEEP_SECONDS"
        (( attempt++ ))
    done

    echo "Health check failed for ${name}" >&2
    docker logs --tail 50 "$name" >&2 || true
    return 1
}

check_container "$API_CONTAINER"
check_container "$FRONTEND_CONTAINER"

echo "Slot ${SLOT} passed health checks."
