<?php

use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\SectionController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordOtpController;

use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\BookLikeController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\AccountController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;


// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordOtpController::class, 'sendCode'])->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordOtpController::class, 'resetWithCode'])->middleware('throttle:10,1');

// OAuth routes
Route::prefix('auth')->group(function () {
    Route::get('/google', [\App\Http\Controllers\Auth\OAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [\App\Http\Controllers\Auth\OAuthController::class, 'handleGoogleCallback']);
    Route::get('/apple', [\App\Http\Controllers\Auth\OAuthController::class, 'redirectToApple']);
    Route::get('/apple/callback', [\App\Http\Controllers\Auth\OAuthController::class, 'handleAppleCallback']);
});

// Protected routes (authenticated users only)
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/become-author', [AuthController::class, 'becomeAuthor']);
    Route::post('/user/change-password', [AccountController::class, 'changePassword']);
    Route::post('/user/change-email/request', [AccountController::class, 'requestEmailChange'])
        ->middleware('throttle:5,1');
    Route::post('/user/change-email/confirm', [AccountController::class, 'confirmEmailChange'])
        ->middleware('throttle:12,1');
    Route::post('/user/send-password-reset', [AccountController::class, 'sendPasswordResetLink']);
    Route::post('/user/deactivate', [AccountController::class, 'deactivate']);
    Route::delete('/user/account', [AccountController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

    // Email verification (6-digit OTP)
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'sendCode'])
         ->middleware('throttle:6,1');
    Route::post('/email/verify-code', [EmailVerificationController::class, 'confirmCode'])
         ->middleware('throttle:12,1');
});

// Books API Routes (Clean Architecture)
Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index']);

    // Protected routes - /me must be before /{id} to avoid route conflicts
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [BookController::class, 'getUserBooks']);
        Route::post('/', [BookController::class, 'store']);
        Route::post('/draft', [BookController::class, 'saveDraft'])
            ->middleware('throttle:45,1');
        Route::post('/draft/{id}', [BookController::class, 'saveDraft'])
            ->middleware(['book.owner', 'throttle:45,1']);
        Route::put('/{id}', [BookController::class, 'update'])->middleware('book.owner');
        Route::delete('/{id}', [BookController::class, 'destroy'])->middleware('book.owner');
        // Accept slug or id for publish
        Route::post('/{slugOrId}/publish', [BookController::class, 'publish'])->middleware('book.owner');
    });

    // Public routes - must be after /me to avoid conflicts
    // Using {slugOrId} to support both slug and ID for backward compatibility
    Route::post('/{slugOrId}/view', [BookController::class, 'recordView'])
        ->middleware('throttle:120,1');
    Route::get('/{slugOrId}', [BookController::class, 'show'])->name('api.books.show');
    Route::get('/{slugOrId}/similar', [BookController::class, 'similarBooks']);
});

// Sections API Routes
Route::prefix('books/{bookId}/sections')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [SectionController::class, 'index']);
    Route::post('/', [SectionController::class, 'store']);
    Route::post('/reorder', [SectionController::class, 'reorder']);
    Route::get('/{id}', [SectionController::class, 'show']);
    Route::put('/{id}', [SectionController::class, 'update']);
    Route::delete('/{id}', [SectionController::class, 'destroy']);
});

// Pages API Routes
Route::prefix('sections/{sectionId}/pages')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [PageController::class, 'index']);
    Route::post('/', [PageController::class, 'store']);
    Route::get('/{id}', [PageController::class, 'show']);
    Route::put('/{id}', [PageController::class, 'update']);
    Route::delete('/{id}', [PageController::class, 'destroy']);
});

// Categories API Routes
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
    });
});

// Ratings API Routes
Route::prefix('ratings')->group(function () {
    // Public route - get ratings for a book
    Route::get('/book/{bookId}', [RatingController::class, 'index']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/book/{bookId}/mine', [RatingController::class, 'mine']);
        Route::post('/', [RatingController::class, 'store']);
    });
});

// Comments API Routes
Route::prefix('comments')->group(function () {
    Route::get('/book/{bookId}', [CommentController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [CommentController::class, 'store']);
        Route::post('/{id}/like', [CommentController::class, 'toggleLike']);
        Route::delete('/{id}/like', [CommentController::class, 'unlike']);
    });
});

// Quotes (highlights / page notes) for profile tab — public; unpublished books hidden unless viewer is owner
Route::get('/quotes', [QuoteController::class, 'index']);

// User API Routes
Route::prefix('users')->group(function () {
    Route::get('/username/{username}', [\App\Http\Controllers\Api\UserController::class, 'getByUsername']);
    Route::get('/{userId}', [\App\Http\Controllers\Api\UserController::class, 'getById']);
    Route::get('/{userId}/comments', [CommentController::class, 'getUserComments']);
});

// Autocomplete API Routes
Route::prefix('autocomplete')->group(function () {
    Route::get('/mentions', [\App\Http\Controllers\Api\AutocompleteController::class, 'mentions']);
});

// Page Notes API Routes
Route::prefix('page-notes')->middleware('auth:sanctum')->group(function () {
    Route::get('/page/{pageId}', [\App\Http\Controllers\Api\PageNoteController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\PageNoteController::class, 'store']);
    Route::put('/{id}', [\App\Http\Controllers\Api\PageNoteController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\PageNoteController::class, 'destroy']);
});

// Bookmarks API Routes
Route::prefix('bookmarks')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [BookmarkController::class, 'index']);
    Route::get('/page/{pageId}/check', [BookmarkController::class, 'check']);
    Route::post('/', [BookmarkController::class, 'store']);
    Route::delete('/{pageId}', [BookmarkController::class, 'destroy']);
});

// Follow API Routes
Route::prefix('follows')->middleware('auth:sanctum')->group(function () {
    Route::get('/check/{followingId}', [FollowController::class, 'check']);
    Route::get('/{userId}/followers', [FollowController::class, 'followers']);
    Route::get('/{userId}/following', [FollowController::class, 'following']);
    Route::post('/', [FollowController::class, 'store']);
    Route::delete('/{followingId}', [FollowController::class, 'destroy']);
});

// Notifications API Routes
Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::post('/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::post('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
});

// Library Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/library', [LibraryController::class, 'index']);
    Route::post('/library', [LibraryController::class, 'store']);
    Route::delete('/library/{bookId}', [LibraryController::class, 'destroy']);
    Route::get('/library/{bookId}/check', [LibraryController::class, 'check']);
    Route::get('/library/{bookId}/reading', [LibraryController::class, 'reading']);
    Route::patch('/library/{bookId}/progress', [LibraryController::class, 'updateProgress']);
    Route::delete('/library/{bookId}/progress', [LibraryController::class, 'clearProgress']);

    Route::get('/likes/books', [BookLikeController::class, 'index']);
    Route::post('/likes/toggle', [BookLikeController::class, 'toggle']);
    Route::get('/likes/books/{bookId}/check', [BookLikeController::class, 'check']);
});
