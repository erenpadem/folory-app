#!/usr/bin/env bash
# Edge nginx + slot routing diagnostics (run on server: ./scripts/verify-edge.sh)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EDGE_URL="${EDGE_URL:-http://127.0.0.1:8082}"

cd "$DEPLOY_DIR"

echo "=== Fo-lory edge diagnostics ==="
echo "Deploy dir: $DEPLOY_DIR"
echo ""

ACTIVE_SLOT="blue"
if [[ -f .active-slot ]]; then
    ACTIVE_SLOT="$(tr -d '[:space:]' < .active-slot)"
fi
echo "Active slot (.active-slot): ${ACTIVE_SLOT}"

if [[ -f nginx/upstreams/active.conf ]]; then
    echo "active.conf upstream:"
    grep -E 'server (api|frontend)-' nginx/upstreams/active.conf || true
else
    echo "WARN: nginx/upstreams/active.conf missing" >&2
fi

echo ""
echo "=== Container status ==="
docker ps --filter name=folory --format 'table {{.Names}}\t{{.Status}}' || true

echo ""
echo "=== Edge HTTP (via host bind) ==="
for path in /up "/api/books?per_page=1" /; do
    code="$(curl -s -o /dev/null -w '%{http_code}' "${EDGE_URL}${path}")"
    echo "${EDGE_URL}${path} → ${code}"
done

echo ""
echo "=== API container (direct) ==="
API_CONTAINER="folory-api-${ACTIVE_SLOT}"
if docker ps --format '{{.Names}}' | grep -qx "$API_CONTAINER"; then
    docker exec "$API_CONTAINER" curl -sf -o /dev/null -w "/up inside ${API_CONTAINER}: %{http_code}\n" http://127.0.0.1/up || echo "${API_CONTAINER}: /up FAILED"
    docker exec "$API_CONTAINER" curl -sf -o /dev/null -w "/api/books inside ${API_CONTAINER}: %{http_code}\n" "http://127.0.0.1/api/books?per_page=1" || echo "${API_CONTAINER}: /api/books FAILED"
else
    echo "WARN: ${API_CONTAINER} not running" >&2
fi

echo ""
echo "=== Edge → API upstream (from folory-edge) ==="
if docker ps --format '{{.Names}}' | grep -qx folory-edge; then
    docker exec folory-edge wget -q -S -O /dev/null "http://api-${ACTIVE_SLOT}:80/up" 2>&1 | head -1 || echo "edge → api-${ACTIVE_SLOT}: FAILED"
else
    echo "WARN: folory-edge not running" >&2
fi

echo ""
echo "=== Edge nginx config (api location) ==="
if docker ps --format '{{.Names}}' | grep -qx folory-edge; then
    docker exec folory-edge grep -n "location.*api" /etc/nginx/conf.d/default.conf || echo "WARN: no api location in default.conf" >&2
fi

echo ""
if curl -sf -o /dev/null "${EDGE_URL}/api/books?per_page=1" && curl -sf -o /dev/null "${EDGE_URL}/up"; then
    echo "OK: edge routing looks healthy."
else
    echo "FIX hints:" >&2
    echo "  1. Sync slot: cp nginx/upstreams/${ACTIVE_SLOT}.conf nginx/upstreams/active.conf" >&2
    echo "  2. /up regex: sed -i 's#^/(api|up|sanctum|storage)/#^/(api|up|sanctum|storage)(/|\$)|#' nginx/conf.d/default.conf" >&2
    echo "  3. Reload: docker compose exec edge nginx -t && docker compose exec edge nginx -s reload" >&2
    echo "  4. Re-run: ./scripts/verify-edge.sh" >&2
    exit 1
fi
