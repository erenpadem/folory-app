FROM php:8.2-fpm

# Sistem bağımlılıklarını yükleyin
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Çalışma dizinini ayarlayın
WORKDIR /var/www/html
