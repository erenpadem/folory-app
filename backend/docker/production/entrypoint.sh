#!/bin/bash
set -euo pipefail

cd /var/www/html

if [ -n "${DB_HOST:-}" ]; then
    /usr/local/bin/wait-for-postgres.sh "$DB_HOST" true
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

php artisan storage:link --force 2>/dev/null || true

exec "$@"
