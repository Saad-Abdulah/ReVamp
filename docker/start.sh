#!/bin/sh

# Ensure storage permissions are correct
chown -R www-data:www-data /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

# Ensure database file exists and has correct permissions
touch /app/database/database.sqlite
chown www-data:www-data /app/database/database.sqlite
chmod 664 /app/database/database.sqlite

# Generate application key if not set
if [ ! -f "/app/.env" ]; then
    echo "Creating .env from .env.example"
    cp /app/.env.example /app/.env
fi

# Check if APP_KEY is set
APP_KEY=$(grep -E "^APP_KEY=" /app/.env | cut -d '=' -f2)
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:GENERATE_NEW_KEY_HERE" ]; then
    echo "Generating new application key"
    php /app/artisan key:generate --force
fi

# Run migrations
echo "Running database migrations"
php /app/artisan migrate --force

# Clear and cache config
php /app/artisan config:clear
php /app/artisan config:cache

# Create storage symlink
php /app/artisan storage:link

# Start supervisor to manage nginx and php-fpm
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
