FROM php:8.2-fpm

ARG user=laravel
ARG uid=1000

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor \
    nginx \
    build-essential \
    openssl \
    libpq-dev \
  && docker-php-ext-install gd pdo pdo_mysql pdo_pgsql pgsql sockets

# Composer binary
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN useradd -G www-data,root -u $uid -d /home/$user -s /bin/bash $user \
    && mkdir -p /home/$user/.composer \
    && chown -R $user:$user /home/$user

# Create log directories and files with proper permissions
RUN mkdir -p /var/log/php-fpm /var/log/nginx /var/log/supervisor \
    && touch /var/log/php-fpm/access.log /var/log/php-fpm/error.log \
    && touch /var/log/nginx/access.log /var/log/nginx/error.log \
    && touch /var/log/supervisor/supervisord.log \
    && chown -R $user:$user /var/log/php-fpm /var/log/nginx /var/log/supervisor

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .

# Fix ownership for project files
RUN chown -R $user:$user /var/www/html

# Copy supervisor config
COPY docker/development/workspace/supervisord.conf /etc/supervisord.conf

# Run as non-root user
USER $user

# Run supervisord with config
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
