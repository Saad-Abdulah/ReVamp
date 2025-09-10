<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Named login route for middleware redirects
Route::get('/login', function () {
    return view('app');
})->name('login');

// Serve the Vue.js application for all non-API routes
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
