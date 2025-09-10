# Use the official PHP 8.2 FPM Alpine image
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /app

# Install system dependencies and Node.js
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    sqlite \
    sqlite-dev \
    nodejs \
    npm \
    supervisor \
    nginx

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Set proper ownership
RUN chown -R www-data:www-data /app

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install Node.js dependencies and build assets
RUN npm ci
RUN npm run build

# Create necessary directories
RUN mkdir -p /app/storage/logs \
    /app/storage/framework/cache \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/storage/app/public/generated \
    /app/storage/app/public/templates \
    /app/storage/app/temp \
    /var/log/supervisor \
    /run/nginx

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache
RUN chmod -R 775 /app/storage /app/bootstrap/cache

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/start.sh /start.sh

# Make start script executable
RUN chmod +x /start.sh

# Generate Laravel application key if not exists
RUN php artisan key:generate --show > /tmp/key.txt

# Run database migrations
RUN touch /app/database/database.sqlite
RUN chown www-data:www-data /app/database/database.sqlite
RUN php artisan migrate --force

# Create symbolic link for storage
RUN php artisan storage:link

# Expose port 80
EXPOSE 80

# Start supervisor (which will manage nginx and php-fpm)
CMD ["/start.sh"]
