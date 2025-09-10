<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Only set default string length when using MySQL
        try {
            if (config('database.default') === 'mysql') {
                Schema::defaultStringLength(191);
            }
        } catch (\Throwable $e) {
            // In case database config isn't ready during boot, skip silently
        }
    }
} 