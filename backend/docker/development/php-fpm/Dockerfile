FROM php:8.2-fpm

# Sistem bağımlılıklarını yükleyin
RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Composer'ı yükleyin
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Çalışma dizinini ayarlayın
WORKDIR /var/www/html

# entrypoint.sh betiğini kopyalayın ve çalıştırılabilir yapın
COPY ./docker/development/php-fpm/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# entrypoint.sh betiğini giriş noktası olarak ayarlayın
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
