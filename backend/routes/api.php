<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Giriş yapmamış kullanıcılar için (register, login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Oturum açmış kullanıcılar için korumalı rotalar
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']); // user metodu AuthController'da olmalı
});
