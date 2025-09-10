<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PdfTemplateController;
use App\Http\Controllers\PdfGeneratorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // PDF Template routes
    Route::prefix('templates')->group(function () {
        Route::get('/', [PdfTemplateController::class, 'index']);
        Route::post('/', [PdfTemplateController::class, 'store']);
        Route::get('/{template}', [PdfTemplateController::class, 'show']);
        Route::put('/{template}', [PdfTemplateController::class, 'update']);
        Route::put('/{template}/fields', [PdfTemplateController::class, 'updateFields']);
        Route::delete('/{template}', [PdfTemplateController::class, 'destroy']);
    });
    
    // PDF Generation routes
    Route::prefix('generate')->group(function () {
        Route::get('/', [PdfGeneratorController::class, 'index']);
        Route::post('/{template}', [PdfGeneratorController::class, 'generate']);
        Route::get('/{generatedPdf}/download', [PdfGeneratorController::class, 'download']);
        Route::delete('/{generatedPdf}', [PdfGeneratorController::class, 'destroy']);
    });
});

// Health check route
Route::get('health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'service' => 'PDF Template Designer API'
    ]);
}); 