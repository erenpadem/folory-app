<?php

namespace App\Infrastructure\Persistence\Eloquent\Book;

use App\Domain\Book\Entities\Book;
use App\Domain\Book\Repositories\BookRepositoryInterface;
use App\Models\Book as BookModel;

class EloquentBookRepository implements BookRepositoryInterface
{
    public function findById(int $id): ?Book
    {
        $model = BookModel::with(['sections.pages'])->find($id);
        return $model ? $this->toEntity($model) : null;
    }

    public function findBySlug(string $slug): ?Book
    {
        $model = BookModel::with(['sections.pages', 'author', 'category'])
            ->where('slug', $slug)
            ->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function findByAuthorId(int $authorId, int $perPage = 15)
    {
        return BookModel::where('author_id', $authorId)->paginate($perPage);
    }

    public function create(Book $book): Book
    {
        $published = $book->isPublished();
        $model = BookModel::create([
            'author_id' => $book->getAuthorId(),
            'category_id' => $book->getCategoryId(),
            'title' => $book->getTitle(),
            'slug' => $book->getSlug(),
            'short_description' => $book->getShortDescription(),
            'cover' => $book->getCover(),
            'read_count' => $book->getReadCount(),
            'total_page' => $book->getTotalPage(),
            'is_adult' => $book->isAdult(),
            'is_draft' => $published ? false : $book->isDraft(),
            'is_published' => $published,
        ]);

        return $this->toEntity($model);
    }

    public function update(Book $book): Book
    {
        $model = BookModel::findOrFail($book->getId());
        $published = $book->isPublished();
        $model->update([
            'category_id' => $book->getCategoryId(),
            'title' => $book->getTitle(),
            'slug' => $book->getSlug(),
            'short_description' => $book->getShortDescription(),
            'cover' => $book->getCover(),
            'read_count' => $book->getReadCount(),
            'total_page' => $book->getTotalPage(),
            'is_adult' => $book->isAdult(),
            'is_draft' => $published ? false : $book->isDraft(),
            'is_published' => $published,
        ]);

        return $this->toEntity($model->fresh());
    }

    public function delete(int $id): bool
    {
        return BookModel::findOrFail($id)->delete();
    }

    public function paginate(int $perPage = 15, array $filters = [])
    {
        $query = BookModel::with(['author', 'category'])
            ->withCount(['sections', 'pages', 'ratings'])
            ->withAvg('ratings', 'score');

        // Search filter
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('short_description', 'LIKE', "%{$search}%")
                  ->orWhereHas('author', function($q) use ($search) {
                      $q->where('name', 'LIKE', "%{$search}%");
                  })
                  ->orWhereHas('category', function($q) use ($search) {
                      $q->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Category filter
        if (isset($filters['category_id']) && !empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Published filter
        if (isset($filters['is_published'])) {
            $isPublished = filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_published', $isPublished);
        } elseif (empty($filters['list_all_statuses'])) {
            // Public listing: only published. "My books" (author_id + list_all_statuses) includes drafts.
            $query->where('is_published', true);
        }

        // Draft filter (dashboard: taslak / yayın ayrımı)
        if (isset($filters['is_draft'])) {
            $isDraft = filter_var($filters['is_draft'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_draft', $isDraft);
        }

        // Author filter
        if (isset($filters['author_id'])) {
            $query->where('author_id', $filters['author_id']);
        }

        // Min/Max chapters filter (use relations count safely across DBs)
        if (isset($filters['minChapters']) && (int)$filters['minChapters'] > 0) {
            $query->has('sections', '>=', (int)$filters['minChapters']);
        }
        if (isset($filters['maxChapters']) && (int)$filters['maxChapters'] > 0) {
            $query->has('sections', '<=', (int)$filters['maxChapters']);
        }

        // Min/Max likes filter (using read_count as likes)
        if (isset($filters['minLikes']) && $filters['minLikes'] > 0) {
            $query->where('read_count', '>=', $filters['minLikes']);
        }
        if (isset($filters['maxLikes']) && $filters['maxLikes'] > 0) {
            $query->where('read_count', '<=', $filters['maxLikes']);
        }

        // Completed only filter (books with total_page > 0 and is_published)
        if (isset($filters['completedOnly']) && $filters['completedOnly']) {
            $query->where('total_page', '>', 0)
                  ->where('is_published', true);
        }

        // Recently updated filter (updated in last 30 days)
        if (isset($filters['recentlyUpdated']) && $filters['recentlyUpdated']) {
            $query->where('updated_at', '>=', now()->subDays(30));
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Map frontend sort values to database columns
        $sortMap = [
            'read_count' => 'read_count',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            'rating' => 'read_count', // Fallback to read_count if rating doesn't exist
            'title' => 'title',
            'popular' => 'read_count',
            'new' => 'created_at',
            'top-rated' => 'read_count',
            'longest' => 'pages_count',
            'shortest' => 'pages_count',
        ];

        $sortColumn = $sortMap[$sortBy] ?? 'created_at';

        // For shortest, reverse the order
        if ($sortBy === 'shortest') {
            $sortOrder = 'asc';
        }

        $query->orderBy($sortColumn, $sortOrder);

        return $query->paginate($perPage);
    }

    public function findPublished(int $perPage = 15)
    {
        return BookModel::where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function findByCategoryId(int $categoryId, int $perPage = 15)
    {
        return BookModel::where('category_id', $categoryId)
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function incrementReadCount(int $id): void
    {
        BookModel::where('id', $id)->increment('read_count');
    }

    private function toEntity(BookModel $model): Book
    {
        return new Book(
            $model->id,
            $model->author_id,
            $model->title,
            $model->is_draft,
            $model->is_published,
            $model->is_adult,
            $model->category_id,
            $model->short_description,
            $model->cover,
            $model->read_count,
            $model->total_page,
            $model->created_at ? new \DateTime($model->created_at) : null,
            $model->updated_at ? new \DateTime($model->updated_at) : null,
            $model->slug
        );
    }
}

