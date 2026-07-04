FROM php:8.3-fpm-bullseye

ARG user=laravel
ARG uid=1000

RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        zip \
        supervisor \
        nginx \
        postgresql-client \
        ca-certificates \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libxml2-dev \
        libpq-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get purge -y --auto-remove $PHPIZE_DEPS \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /run/php && chown www-data:www-data /run/php

RUN useradd -G www-data,root -u $uid -d /home/$user -s /bin/bash $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user

RUN mkdir -p /var/log/nginx /var/log/php-fpm /var/log/supervisor \
    && chown -R www-data:www-data /var/log/nginx \
    && touch /var/log/supervisor/supervisord.log

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www/html

ENV COMPOSER_PROCESS_TIMEOUT=600 \
    COMPOSER_HTTP_TIMEOUT=120

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .

RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && php artisan package:discover --ansi \
    && chown -R $user:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

COPY docker/production/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/production/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/development/workspace/php-uploads.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/production/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/development/workspace/wait-for-postgres.sh /usr/local/bin/wait-for-postgres.sh

RUN chmod +x /usr/local/bin/entrypoint.sh /usr/local/bin/wait-for-postgres.sh

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -sf http://127.0.0.1/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n"]
