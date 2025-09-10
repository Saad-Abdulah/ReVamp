#!/bin/sh

# Ensure storage permissions are correct
chown -R www-data:www-data /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

# Ensure logs directory and file exist with proper permissions
mkdir -p /app/storage/logs
touch /app/storage/logs/laravel.log
chown www-data:www-data /app/storage/logs/laravel.log
chmod 664 /app/storage/logs/laravel.log

# Ensure database file exists and has correct permissions
mkdir -p /app/database
touch /app/database/database.sqlite
chown www-data:www-data /app/database/database.sqlite
chmod 664 /app/database/database.sqlite

# Generate application key if not set
if [ ! -f "/app/.env" ]; then
    echo "Creating .env from .env.example"
    cp /app/.env.example /app/.env
fi

# Ensure APP_KEY is set - generate if missing or empty
if [ -z "$APP_KEY" ]; then
    echo "Generating new application key"
    export APP_KEY=$(php /app/artisan key:generate --show --force)
    echo "Generated APP_KEY: $APP_KEY"
fi

# Also set in .env file if it exists
if [ -f "/app/.env" ]; then
    if ! grep -q "^APP_KEY=" /app/.env; then
        echo "APP_KEY=$APP_KEY" >> /app/.env
    else
        sed -i "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" /app/.env
    fi
fi

# Run migrations
echo "Running database migrations"
php /app/artisan migrate --force

# Clear and cache config
php /app/artisan config:clear
php /app/artisan config:cache
php /app/artisan view:clear

# Create storage symlink
php /app/artisan storage:link

# Start supervisor to manage nginx and php-fpm
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
