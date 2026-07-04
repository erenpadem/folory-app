#!/bin/bash
set -euo pipefail

cd /var/www/html

if [ -n "${DB_HOST:-}" ]; then
    /usr/local/bin/wait-for-postgres.sh "$DB_HOST" true
fi

# Artisan as www-data (same user as php-fpm)
artisan() {
    su -s /bin/sh www-data -c "cd /var/www/html && php artisan $*"
}

artisan package:discover --ansi

artisan optimize:clear || true

artisan config:cache
artisan route:cache
artisan view:cache

chown -R www-data:www-data bootstrap/cache storage
chmod -R 775 bootstrap/cache storage

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    artisan migrate --force --no-interaction
fi

artisan storage:link --force 2>/dev/null || true

exec "$@"
