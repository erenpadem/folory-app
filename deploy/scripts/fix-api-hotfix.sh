#!/usr/bin/env bash
# One-shot hotfix for api-green 404 (run on server: ./scripts/fix-api-hotfix.sh [blue|green])
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SLOT="${1:-green}"
API="folory-api-${SLOT}"

cd "$DEPLOY_DIR"

echo "=== Fixing ${API} ==="

if ! docker ps --format '{{.Names}}' | grep -qx "$API"; then
    echo "Container ${API} not running" >&2
    exit 1
fi

echo "→ Redis PHP extension"
docker exec -u root "$API" bash -c '
  apt-get update -qq
  apt-get install -y -qq $PHPIZE_DEPS
  pecl install redis
  docker-php-ext-enable redis
  apt-get purge -y --auto-remove $PHPIZE_DEPS
' 2>/dev/null || echo "  (redis may already be installed)"

echo "→ nginx fastcgi SCRIPT_FILENAME"
docker exec -u root "$API" sed -i \
  's|\$document_root\$fastcgi_script_name|\$realpath_root\$fastcgi_script_name|' \
  /etc/nginx/conf.d/default.conf

echo "→ Remove Debian default site (conflicting server_name _ → 404)"
docker exec -u root "$API" rm -f /etc/nginx/sites-enabled/default

echo "→ Ensure Laravel vhost is default_server"
docker exec -u root "$API" sed -i 's/listen 80;/listen 80 default_server;/' /etc/nginx/conf.d/default.conf

echo "→ Clear bootstrap cache"
docker exec -u root "$API" rm -f /var/www/html/bootstrap/cache/*.php

echo "→ Rebuild cache as www-data"
docker exec -u www-data "$API" php artisan package:discover --ansi
docker exec -u www-data "$API" php artisan config:cache
docker exec -u www-data "$API" php artisan route:cache

echo "→ Restart nginx + php-fpm"
docker exec "$API" supervisorctl restart nginx php-fpm

sleep 2

echo ""
echo "=== Results ==="
docker exec "$API" curl -s -o /dev/null -w "${API} /up: %{http_code}\n" http://127.0.0.1/up
docker exec "$API" curl -s -o /dev/null -w "${API} /api/books: %{http_code}\n" "http://127.0.0.1/api/books?per_page=1"

UP_CODE="$(docker exec "$API" curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/up)"
if [[ "$UP_CODE" != "200" ]]; then
    echo ""
    echo "Still failing — diagnostics:" >&2
    docker exec "$API" supervisorctl status >&2 || true
    docker exec "$API" ls -la /etc/nginx/sites-enabled/ 2>&1 >&2 || true
    docker exec "$API" curl -s http://127.0.0.1/up 2>&1 | head -5 >&2 || true
    docker exec "$API" curl -s -o /dev/null -w "direct /up: %{http_code}\n" http://127.0.0.1/up >&2 || true
    docker logs "$API" --tail 30 2>&1 | grep -iE 'script|error|fatal|redis' >&2 || docker logs "$API" --tail 15 >&2
    exit 1
fi

echo "OK — reload edge if needed: docker compose exec edge nginx -s reload"
