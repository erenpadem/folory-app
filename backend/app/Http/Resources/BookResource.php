<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Infrastructure\Persistence\Eloquent\Section\EloquentSectionRepository;
use App\Infrastructure\Persistence\Eloquent\Page\EloquentPageRepository;
use App\Domain\Rating\Repositories\RatingRepositoryInterface;
use App\Models\Book as BookModel;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Handle both Book entity and BookModel
        if ($this->resource instanceof BookModel) {
            $model = $this->resource;
            if (! array_key_exists('ratings_count', $model->getAttributes())) {
                $model->loadCount('ratings');
            }
            if (! array_key_exists('ratings_avg_score', $model->getAttributes())) {
                $model->loadAvg('ratings', 'score');
            }
            $bookId = $model->id;
            $authorId = $model->author_id;
            $categoryId = $model->category_id;
            $title = $model->title;
            $slug = $model->slug;
            $shortDescription = $model->short_description;
            $cover = $model->cover;
            $readCount = $model->read_count;
            $totalPage = $model->total_page;
            $isAdult = $model->is_adult;
            $isDraft = $model->is_draft;
            $isPublished = $model->is_published;
            $createdAt = $model->created_at;
            $updatedAt = $model->updated_at;
        } else {
            // Book entity
            $book = $this->resource;
            $bookId = $book->getId();
            $authorId = $book->getAuthorId();
            $categoryId = $book->getCategoryId();
            $title = $book->getTitle();
            $slug = $book->getSlug();
            $shortDescription = $book->getShortDescription();
            $cover = $book->getCover();
            $readCount = $book->getReadCount();
            $totalPage = $book->getTotalPage();
            $isAdult = $book->isAdult();
            $isDraft = $book->isDraft();
            $isPublished = $book->isPublished();
            $createdAt = $book->getCreatedAt();
            $updatedAt = $book->getUpdatedAt();

            // Load model for relationships (aggregates avoid N+1 when listing)
            $model = BookModel::with(['author', 'category'])
                ->withCount('ratings')
                ->withAvg('ratings', 'score')
                ->find($bookId);
        }

        if ($isPublished) {
            $isDraft = false;
        }

        $ratingRepository = app(RatingRepositoryInterface::class);
        if ($model !== null && ($model->ratings_avg_score !== null || array_key_exists('ratings_avg_score', $model->getAttributes()))) {
            $averageRating = (float) ($model->ratings_avg_score ?? 0);
        } else {
            $averageRating = $ratingRepository->getAverageRatingByBookId($bookId);
        }
        
        // Load sections and pages from repository (only if needed)
        $sections = [];
        // Include sections for show endpoints or when explicitly requested
        $shouldIncludeSections = false;
        if ($request->route()) {
            $route = $request->route();
            // Prefer route name if available
            if (method_exists($route, 'getName') && in_array($route->getName(), ['books.show', 'api.books.show'])) {
                $shouldIncludeSections = true;
            } else {
                // Fallback to URI pattern check
                $uri = method_exists($route, 'uri') ? $route->uri() : null;
                if (is_string($uri)) {
                    // api/books/{slugOrId} and not similar listing endpoints
                    if (str_starts_with($uri, 'api/books') && !str_contains($uri, '/similar') && $request->method() === 'GET') {
                        $shouldIncludeSections = true;
                    }
                }
            }
        }
        // Explicit opt-in via query ?include=sections
        if ($request->has('include')) {
            $include = $request->get('include');
            if (is_string($include) && (strpos($include, 'sections') !== false)) {
                $shouldIncludeSections = true;
            } elseif (is_array($include) && in_array('sections', $include, true)) {
                $shouldIncludeSections = true;
            }
        }
        // Wizard draft save: must return sections + pages + is_visible so client state stays in sync
        if ($request->isMethod('POST') && str_contains($request->path(), 'draft')) {
            $shouldIncludeSections = true;
        }
        if ($shouldIncludeSections) {
            if ($bookId) {
                $sectionRepository = app(EloquentSectionRepository::class);
                $sectionEntities = $sectionRepository->findByBookId($bookId);
                
                $pageRepository = app(EloquentPageRepository::class);

                $isOwner = $request->user() && (int) $request->user()->id === (int) $authorId;

                foreach ($sectionEntities as $section) {
                    if (!$section->isVisible() && !$isOwner) {
                        continue;
                    }

                    $pages = $pageRepository->findBySectionId($section->getId());
                    $sections[] = [
                        'id' => $section->getId(),
                        'book_id' => $section->getBookId(),
                        'title' => $section->getTitle(),
                        'order' => $section->getOrder(),
                        'total_page' => $section->getTotalPage(),
                        'is_visible' => $section->isVisible(),
                        'created_at' => $section->getCreatedAt() ? $section->getCreatedAt()->format('Y-m-d H:i:s') : null,
                        'updated_at' => $section->getUpdatedAt() ? $section->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                        'pages' => array_map(function ($page) {
                            return [
                                'id' => $page->getId(),
                                'section_id' => $page->getSectionId(),
                                'content' => $page->getContent(),
                                'order' => $page->getOrder(),
                                'created_at' => $page->getCreatedAt() ? $page->getCreatedAt()->format('Y-m-d H:i:s') : null,
                                'updated_at' => $page->getUpdatedAt() ? $page->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                            ];
                        }, $pages),
                    ];
                }
            }
        }
        
        return [
            'id' => $bookId,
            'author_id' => $authorId,
            'category_id' => $categoryId,
            'title' => $title,
            'slug' => $slug,
            'short_description' => $shortDescription,
            'cover' => $cover,
            'read_count' => $readCount,
            'total_page' => $totalPage,
            'is_adult' => $isAdult,
            'is_draft' => $isDraft,
            'is_published' => $isPublished,
            'created_at' => $createdAt instanceof \DateTime ? $createdAt->format('Y-m-d H:i:s') : ($createdAt ? $createdAt : null),
            'updated_at' => $updatedAt instanceof \DateTime ? $updatedAt->format('Y-m-d H:i:s') : ($updatedAt ? $updatedAt : null),
            'author' => $model && $model->author ? [
                'id' => $model->author->id,
                'name' => $model->author->name,
                'username' => $model->author->username,
                'avatar' => $model->author->avatar,
            ] : null,
            'category' => $model && $model->category ? [
                'id' => $model->category->id,
                'name' => $model->category->name,
                'slug' => $model->category->slug,
            ] : null,
            'average_rating' => $averageRating > 0 ? round($averageRating, 1) : null,
            'rating_count' => $model ? (int) ($model->ratings_count ?? $model->ratings()->count()) : 0,
            'sections' => $sections,
        ];
    }
}

