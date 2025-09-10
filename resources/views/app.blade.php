<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'PDF Template Designer') }}</title>
        
        <!-- Preconnect to external fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        
        <!-- Meta tags for PWA -->
        <meta name="theme-color" content="#3b82f6">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        
        <!-- Open Graph meta tags -->
        <meta property="og:title" content="{{ config('app.name', 'PDF Template Designer') }}">
        <meta property="og:description" content="Create dynamic PDF templates with drag-and-drop field placement">
        <meta property="og:type" content="website">

        <!-- Scripts -->
        @vite(['resources/js/app.js'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
        
        <!-- Loading fallback -->
        <noscript>
            <div style="text-align: center; padding: 50px; font-family: system-ui, sans-serif;">
                <h1>PDF Template Designer</h1>
                <p>This application requires JavaScript to function properly.</p>
                <p>Please enable JavaScript in your browser and refresh the page.</p>
            </div>
        </noscript>
    </body>
</html>
