<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);

// Protected routes (authenticated users only)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])
     ->middleware('guest')
     ->name('password.email');
    
    // Email Verification
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])
         ->middleware('throttle:6,1');
    Route::post('/email/verify', [EmailVerificationController::class, 'verify']);
    
    // Password Reset
    Route::post('/reset-password', [ResetPasswordController::class, 'reset']);
});