#!/usr/bin/env bash
# Blue-green slot switch: updates upstream and reloads edge nginx without dropping connections.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
UPSTREAM_DIR="$DEPLOY_DIR/nginx/upstreams"

SLOT="${1:-}"
if [[ "$SLOT" != "blue" && "$SLOT" != "green" ]]; then
    echo "Usage: $0 <blue|green>" >&2
    exit 1
fi

cp "$UPSTREAM_DIR/${SLOT}.conf" "$UPSTREAM_DIR/active.conf"

cd "$DEPLOY_DIR"
if docker compose ps --status running --format '{{.Service}}' edge 2>/dev/null | grep -qx edge; then
    docker compose exec edge nginx -t
    docker compose exec edge nginx -s reload
else
    docker compose up -d edge
fi

echo "$SLOT" > "$DEPLOY_DIR/.active-slot"
echo "Traffic switched to ${SLOT} slot."
