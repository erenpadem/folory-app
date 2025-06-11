FROM php:8.2-fpm

ARG user=laravel
ARG uid=1000

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libonig-dev libxml2-dev zip unzip supervisor nginx \
    build-essential openssl libpq-dev postgresql-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql pdo_pgsql pgsql sockets mbstring xml opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/run/nginx /var/cache/nginx /var/run/supervisor \
    && touch /var/run/nginx.pid \
    && useradd -G www-data,root -u $uid -d /home/$user -s /bin/bash $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user \
    && mkdir -p /var/log/php-fpm /var/log/nginx /var/log/supervisor \
    && touch /var/log/php-fpm/access.log /var/log/php-fpm/error.log \
    && touch /var/log/nginx/access.log /var/log/nginx/error.log \
    && touch /var/log/supervisor/supervisord.log \
    && chown -R $user:$user /var/log/php-fpm /var/log/nginx /var/log/supervisor /var/run/nginx /var/cache/nginx /var/run/supervisor

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

RUN chown -R $user:$user /var/www/html \
    && chmod -R 775 storage bootstrap/cache

COPY docker/development/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/development/workspace/supervisord.conf /etc/supervisord.conf

USER root

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
