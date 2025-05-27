#!/bin/bash

# Laravel uygulaması için gerekli başlangıç işlemleri
# Örneğin, composer bağımlılıklarını yükleme ve veritabanı migrasyonları

# Composer bağımlılıklarını yükle
composer install --no-interaction --prefer-dist --optimize-autoloader

# Veritabanı migrasyonlarını çalıştır
php artisan migrate --force

# PHP-FPM servisini başlat
exec php-fpm
