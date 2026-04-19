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
        build-essential \
        ca-certificates \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libxml2-dev \
        libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# PHP-FPM socket directory
RUN mkdir -p /run/php && chown www-data:www-data /run/php

# Add Laravel user
RUN useradd -G www-data,root -u $uid -d /home/$user -s /bin/bash $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user

# Logs
RUN mkdir -p /var/log/nginx /var/log/php-fpm /var/log/supervisor \
    && chown -R www-data:www-data /var/log/nginx \
    && touch /var/log/supervisor/supervisord.log

# Composer - Install directly for ARM64 compatibility
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www/html

# Laravel deps
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

RUN chown -R $user:$user /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Configs
COPY docker/development/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/development/workspace/php-uploads.ini /usr/local/etc/php/conf.d/uploads.ini
COPY docker/development/workspace/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-n"]
