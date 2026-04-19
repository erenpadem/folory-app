<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Domain Repository Interfaces
use App\Domain\User\Repositories\UserRepositoryInterface;
use App\Domain\Category\Repositories\CategoryRepositoryInterface;
use App\Domain\Book\Repositories\BookRepositoryInterface;
use App\Domain\Section\Repositories\SectionRepositoryInterface;
use App\Domain\Page\Repositories\PageRepositoryInterface;
use App\Domain\Draft\Repositories\DraftRepositoryInterface;
use App\Domain\Bookmark\Repositories\BookmarkRepositoryInterface;
use App\Domain\Rating\Repositories\RatingRepositoryInterface;
use App\Domain\Comment\Repositories\CommentRepositoryInterface;
use App\Domain\BookReading\Repositories\BookReadingRepositoryInterface;
use App\Domain\SectionReading\Repositories\SectionReadingRepositoryInterface;
use App\Domain\Badge\Repositories\BadgeRepositoryInterface;
use App\Domain\Follow\Repositories\FollowRepositoryInterface;

// Infrastructure Repository Implementations
use App\Infrastructure\Persistence\Eloquent\User\EloquentUserRepository;
use App\Infrastructure\Persistence\Eloquent\Category\EloquentCategoryRepository;
use App\Infrastructure\Persistence\Eloquent\Book\EloquentBookRepository;
use App\Infrastructure\Persistence\Eloquent\Section\EloquentSectionRepository;
use App\Infrastructure\Persistence\Eloquent\Page\EloquentPageRepository;
use App\Infrastructure\Persistence\Eloquent\Draft\EloquentDraftRepository;
use App\Infrastructure\Persistence\Eloquent\Bookmark\EloquentBookmarkRepository;
use App\Infrastructure\Persistence\Eloquent\Rating\EloquentRatingRepository;
use App\Infrastructure\Persistence\Eloquent\Comment\EloquentCommentRepository;
use App\Infrastructure\Persistence\Eloquent\BookReading\EloquentBookReadingRepository;
use App\Infrastructure\Persistence\Eloquent\SectionReading\EloquentSectionReadingRepository;
use App\Infrastructure\Persistence\Eloquent\Badge\EloquentBadgeRepository;
use App\Infrastructure\Persistence\Eloquent\Follow\EloquentFollowRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repository Bindings
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(BookRepositoryInterface::class, EloquentBookRepository::class);
        $this->app->bind(SectionRepositoryInterface::class, EloquentSectionRepository::class);
        $this->app->bind(PageRepositoryInterface::class, EloquentPageRepository::class);
        $this->app->bind(DraftRepositoryInterface::class, EloquentDraftRepository::class);
        $this->app->bind(BookmarkRepositoryInterface::class, EloquentBookmarkRepository::class);
        $this->app->bind(RatingRepositoryInterface::class, EloquentRatingRepository::class);
        $this->app->bind(CommentRepositoryInterface::class, EloquentCommentRepository::class);
        $this->app->bind(BookReadingRepositoryInterface::class, EloquentBookReadingRepository::class);
        $this->app->bind(SectionReadingRepositoryInterface::class, EloquentSectionReadingRepository::class);
        $this->app->bind(BadgeRepositoryInterface::class, EloquentBadgeRepository::class);
        $this->app->bind(FollowRepositoryInterface::class, EloquentFollowRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register SocialiteProviders event listeners for Apple
        $socialiteWasCalled = \SocialiteProviders\Manager\SocialiteWasCalled::class;
        \Illuminate\Support\Facades\Event::listen($socialiteWasCalled, function ($socialiteWasCalled) {
            $socialiteWasCalled->extendSocialite('apple', \SocialiteProviders\Apple\Provider::class);
        });
    }
}
