<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Book\CreateBookUseCase;
use App\Application\UseCases\Book\GetBookUseCase;
use App\Application\UseCases\Book\ListBooksUseCase;
use App\Application\UseCases\Book\UpdateBookUseCase;
use App\Application\UseCases\Book\DeleteBookUseCase;
use App\Application\UseCases\Book\PublishBookUseCase;
use App\Domain\Book\Repositories\BookRepositoryInterface;
use App\Http\Requests\Book\StoreBookRequest;
use App\Http\Requests\Book\UpdateBookRequest;
use App\Http\Requests\Book\SaveDraftRequest;
use App\Http\Resources\BookResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Application\UseCases\Section\CreateSectionUseCase;
use App\Application\UseCases\Section\DeleteSectionUseCase;
use App\Application\UseCases\Section\UpdateSectionUseCase;
use App\Application\UseCases\Page\CreatePageUseCase;
use App\Application\UseCases\Page\DeletePageUseCase;
use App\Application\UseCases\Page\UpdatePageUseCase;
use App\Services\NotificationService;
use App\Domain\Book\Entities\Book as BookEntity;
use App\Models\Book;
use App\Models\Page;

class BookController extends Controller
{
    public function __construct(
        private CreateBookUseCase $createBookUseCase,
        private GetBookUseCase $getBookUseCase,
        private ListBooksUseCase $listBooksUseCase,
        private UpdateBookUseCase $updateBookUseCase,
        private DeleteBookUseCase $deleteBookUseCase,
        private PublishBookUseCase $publishBookUseCase,
        private BookRepositoryInterface $bookRepository,
        private CreateSectionUseCase $createSectionUseCase,
        private UpdateSectionUseCase $updateSectionUseCase,
        private DeleteSectionUseCase $deleteSectionUseCase,
        private CreatePageUseCase $createPageUseCase,
        private UpdatePageUseCase $updatePageUseCase,
        private DeletePageUseCase $deletePageUseCase,
        private NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only([
            'category_id',
            'is_published',
            'author_id',
            'search',
            'sort_by',
            'sort_order'
        ]);

        // Convert is_published string to boolean if provided
        if (isset($filters['is_published']) && is_string($filters['is_published'])) {
            $filters['is_published'] = filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN);
        }

        $books = $this->listBooksUseCase->execute($perPage, $filters);
    
        return response()->json([
            'data' => BookResource::collection($books->items()),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ]
        ]);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        if ($response = $this->assertAuthorCanWrite($request)) {
            return $response;
        }

        $data = $request->validated();
        $data['author_id'] = $request->user()->id;

        $book = $this->createBookUseCase->execute($data);

        return response()->json(new BookResource($book), 201);
    }

    public function show(Request $request, string $slugOrId): JsonResponse
    {
        $book = $this->resolveBookEntity($slugOrId);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap bulunamadı'
            ], 404);
        }

        if (!$this->viewerMayAccessBook($request, $book)) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap bulunamadı'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new BookResource($book)
        ]);
    }

    /**
     * Record a book view (guests allowed for published books). Throttled per IP.
     */
    public function recordView(Request $request, string $slugOrId): JsonResponse
    {
        $book = $this->resolveBookEntity($slugOrId);

        if (!$book || !$book->getId()) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap bulunamadı'
            ], 404);
        }

        if (!$this->viewerMayAccessBook($request, $book)) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap bulunamadı'
            ], 404);
        }

        $this->bookRepository->incrementReadCount($book->getId());

        return response()->json(['success' => true]);
    }

    private function resolveBookEntity(string $slugOrId): ?BookEntity
    {
        if (is_numeric($slugOrId)) {
            return $this->getBookUseCase->execute((int) $slugOrId);
        }

        return $this->getBookUseCase->executeBySlug($slugOrId);
    }

    private function viewerMayAccessBook(Request $request, BookEntity $book): bool
    {
        if ($book->isPublished()) {
            return true;
        }

        // Public book routes do not use auth:sanctum middleware; Bearer token is resolved via sanctum guard only.
        $user = auth('sanctum')->user();
        if (!$user) {
            return false;
        }

        return (int) $user->id === (int) $book->getAuthorId();
    }

    public function update(UpdateBookRequest $request, int $id): JsonResponse
    {
        if ($response = $this->assertAuthorCanWrite($request)) {
            return $response;
        }

        $book = $this->updateBookUseCase->execute($id, $request->validated());

        return response()->json(new BookResource($book));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->deleteBookUseCase->execute($id);

        return response()->json(['message' => 'Book deleted successfully'], 200);
    }

    public function getUserBooks(Request $request): JsonResponse
    {
        try {
            $perPage = min(max((int) $request->get('per_page', 50), 1), 100);
            $userId = $request->user()->id;

            $filters = [
                'author_id' => $userId,
            ];

            $search = $request->get('search');
            if ($search !== null && trim((string) $search) !== '') {
                $filters['search'] = trim((string) $search);
            }

            $hasStatusFilter = $request->has('is_published') || $request->has('is_draft');
            if ($hasStatusFilter) {
                if ($request->has('is_published')) {
                    $filters['is_published'] = filter_var($request->get('is_published'), FILTER_VALIDATE_BOOLEAN);
                }
                if ($request->has('is_draft')) {
                    $filters['is_draft'] = filter_var($request->get('is_draft'), FILTER_VALIDATE_BOOLEAN);
                }
            } else {
                $filters['list_all_statuses'] = true;
            }

            $sortBy = $request->get('sort_by');
            $sortOrder = $request->get('sort_order');
            if (is_string($sortBy) && $sortBy !== '') {
                $filters['sort_by'] = $sortBy;
            }
            if (is_string($sortOrder) && $sortOrder !== '') {
                $filters['sort_order'] = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';
            }

            $books = $this->listBooksUseCase->execute($perPage, $filters);

            $counts = [
                'all' => \App\Models\Book::where('author_id', $userId)->count(),
                'published' => \App\Models\Book::where('author_id', $userId)->where('is_published', true)->count(),
                'draft' => \App\Models\Book::where('author_id', $userId)->where('is_draft', true)->where('is_published', false)->count(),
            ];

            // Convert paginated models to entities for BookResource
            $bookEntities = collect($books->items())->map(function ($model) {
                try {
                    return $this->getBookUseCase->execute($model->id);
                } catch (\Exception $e) {
                    Log::warning("Failed to convert book model to entity: " . $e->getMessage());
                    return null;
                }
            })->filter();

            return response()->json([
                'data' => BookResource::collection($bookEntities),
                'meta' => [
                    'current_page' => $books->currentPage(),
                    'last_page' => $books->lastPage(),
                    'per_page' => $books->perPage(),
                    'total' => $books->total(),
                    'counts' => $counts,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user books: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Kitaplar yüklenirken bir hata oluştu',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function similarBooks(Request $request, string $slugOrId): JsonResponse
    {
        $book = $this->resolveBookEntity($slugOrId);

        if (!$book || !$this->viewerMayAccessBook($request, $book)) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap bulunamadı'
            ], 404);
        }

        $similarBooks = $book->getCategoryId()
            ? $this->bookRepository->findByCategoryId($book->getCategoryId(), 5)
            : $this->listBooksUseCase->execute(5, ['is_published' => true]);

        return response()->json([
            'data' => BookResource::collection($similarBooks->items()),
            'message' => 'Similar books retrieved successfully.'
        ]);
    }

    public function publish(Request $request, string $slugOrId): JsonResponse
    {
        try {
            if ($response = $this->assertAuthorCanWrite($request)) {
                return $response;
            }

            // Resolve slug or id (withCount('pages') on hasManyThrough can mis-count; count explicitly)
            if (is_numeric($slugOrId)) {
                $model = Book::query()->findOrFail((int) $slugOrId);
            } else {
                $model = Book::query()->where('slug', $slugOrId)->firstOrFail();
            }

            $sectionsCount = $model->sections()->count();
            $pagesCount = Page::query()
                ->whereHas('section', static function ($q) use ($model): void {
                    $q->where('book_id', $model->id);
                })
                ->count();

            if ($sectionsCount < 1 || $pagesCount < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kitap yayımlanmadan önce en az 1 bölüm ve 1 sayfa içermelidir.',
                    'data' => [
                        'sections_count' => $sectionsCount,
                        'pages_count' => $pagesCount,
                    ],
                ], 422);
            }

            // Flip flags via use case using numeric id
            $book = $this->publishBookUseCase->execute($model->id);

            // Notify followers about new book
            $this->notificationService->notifyNewBookPublished($book);

            return response()->json([
                'success' => true,
                'data' => new BookResource($book),
                'message' => 'Kitap başarıyla yayınlandı.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Yayınlama başarısız: ' . $e->getMessage()
            ], 400);
        }
    }

    public function saveDraft(SaveDraftRequest $request, ?int $id = null): JsonResponse
    {
        try {
            if ($response = $this->assertAuthorCanWrite($request)) {
                return $response;
            }

            $data = $request->validated();
            $userId = $request->user()->id;

            // Create or update book
            if ($id) {
                $book = $this->updateBookUseCase->execute(
                    $id,
                    $this->mergeDraftSavePayload($data, $id)
                );
            } else {
                // If a draft already exists for same author+title, update it instead of creating new
                $existingDraft = null;
                if (!empty($data['title'])) {
                    $existingDraft = \App\Models\Book::where('author_id', $userId)
                        ->where('title', $data['title'])
                        ->first();
                }

                if ($existingDraft) {
                    // Update existing record (treat as draft save)
                    $id = $existingDraft->id;
                    $book = $this->updateBookUseCase->execute(
                        $id,
                        $this->mergeDraftSavePayload($data, $id)
                    );
                } else {
                    $data['author_id'] = $userId;
                    $data['is_draft'] = true;
                    $data['is_published'] = false;
                    $book = $this->createBookUseCase->execute($data);
                    $id = $book->getId();
                }
            }

            // Save sections and pages if provided
            if (isset($data['sections']) && is_array($data['sections'])) {
                /** @var int[] $survivingSectionIds Payload’taki her bölümden sonra kalan bölüm id’leri */
                $survivingSectionIds = [];

                foreach ($data['sections'] as $sectionData) {
                    $sectionId = isset($sectionData['id']) ? $sectionData['id'] : null;

                    // Only process if sectionId is a positive integer (real ID from backend)
                    // Negative IDs are temporary client-side IDs
                    if ($sectionId && $sectionId > 0) {
                        try {
                            // Update existing section
                            $this->updateSectionUseCase->execute($sectionId, [
                                'title' => $sectionData['title'],
                                'order' => isset($sectionData['order']) ? $sectionData['order'] : 0,
                                'is_visible' => isset($sectionData['is_visible']) ? $sectionData['is_visible'] : true,
                            ]);
                        } catch (\Exception $e) {
                            // Fallback: create new section (no title-based merge — avoids wrong row reuse)
                            $created = $this->createSectionUseCase->execute($id, [
                                'title' => $sectionData['title'] ?? '',
                                'order' => isset($sectionData['order']) ? $sectionData['order'] : 0,
                                'is_visible' => isset($sectionData['is_visible']) ? $sectionData['is_visible'] : true,
                            ]);
                            $sectionId = $created->getId();
                        }
                    } else {
                        $created = $this->createSectionUseCase->execute($id, [
                            'title' => $sectionData['title'] ?? '',
                            'order' => $sectionData['order'] ?? 0,
                            'is_visible' => $sectionData['is_visible'] ?? true,
                        ]);
                        $sectionId = $created->getId();
                    }

                    if (!$sectionId) {
                        continue;
                    }

                    $survivingSectionIds[] = (int) $sectionId;

                    // Save pages for this section
                    if (isset($sectionData['pages']) && is_array($sectionData['pages'])) {
                        /** @var int[] $survivingPageIds Payload’taki her satırdan sonra kalan satır id’leri (yeni oluşturulanlar dahil) */
                        $survivingPageIds = [];

                        foreach ($sectionData['pages'] as $pageIdx => $pageData) {
                            $pageId = isset($pageData['id']) ? $pageData['id'] : null;
                            $pageOrder = isset($pageData['order']) ? (int)$pageData['order'] : null;
                            $resolvedOrder = $pageOrder !== null ? $pageOrder : (int) $pageIdx;

                            // Only process if pageId is a positive integer (real ID from backend)
                            if ($pageId && $pageId > 0) {
                                try {
                                    $saved = $this->updatePageUseCase->execute((int) $pageId, [
                                        'content' => isset($pageData['content']) ? $pageData['content'] : '',
                                        'order' => isset($pageData['order']) ? $pageData['order'] : $resolvedOrder,
                                    ]);
                                    $survivingPageIds[] = $saved->getId();
                                } catch (\Exception $e) {
                                    // Fallback to create/update by (section_id, order)
                                    $existingPage = \App\Models\Page::where('section_id', $sectionId)
                                        ->where('order', $resolvedOrder)
                                        ->first();
                                    if ($existingPage) {
                                        $saved = $this->updatePageUseCase->execute($existingPage->id, [
                                            'content' => isset($pageData['content']) ? $pageData['content'] : '',
                                            'order' => $resolvedOrder,
                                        ]);
                                        $survivingPageIds[] = $saved->getId();
                                    } else {
                                        $saved = $this->createPageUseCase->execute($sectionId, [
                                            'content' => isset($pageData['content']) ? $pageData['content'] : '',
                                            'order' => $resolvedOrder,
                                        ]);
                                        $survivingPageIds[] = $saved->getId();
                                    }
                                }
                            } else {
                                // Create new page (or upsert by order)
                                $existingPage = \App\Models\Page::where('section_id', $sectionId)
                                    ->where('order', $resolvedOrder)
                                    ->first();
                                if ($existingPage) {
                                    $saved = $this->updatePageUseCase->execute($existingPage->id, [
                                        'content' => isset($pageData['content']) ? $pageData['content'] : '',
                                        'order' => $resolvedOrder,
                                    ]);
                                    $survivingPageIds[] = $saved->getId();
                                } else {
                                    $saved = $this->createPageUseCase->execute($sectionId, [
                                        'content' => $pageData['content'] ?? '',
                                        'order' => $resolvedOrder,
                                    ]);
                                    $survivingPageIds[] = $saved->getId();
                                }
                            }
                        }

                        // Client removed pages locally: drop rows not produced by this payload pass
                        $orphanQuery = \App\Models\Page::query()
                            ->where('section_id', $sectionId);
                        if ($survivingPageIds !== []) {
                            $orphanQuery->whereNotIn('id', $survivingPageIds);
                        }
                        foreach ($orphanQuery->pluck('id') as $orphanId) {
                            $this->deletePageUseCase->execute((int) $orphanId);
                        }
                    }
                }

                // Client removed sections locally: drop rows not produced by this payload pass
                $orphanSectionQuery = \App\Models\Section::query()->where('book_id', $id);
                if ($survivingSectionIds !== []) {
                    $orphanSectionQuery->whereNotIn('id', $survivingSectionIds);
                }
                foreach ($orphanSectionQuery->pluck('id') as $orphanSectionId) {
                    $this->deleteSectionUseCase->execute((int) $orphanSectionId);
                }
            }

            // Reload book with relations
            $book = $this->getBookUseCase->execute($id);

            if (!$book) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kitap kaydedildi ancak yeniden yüklenemedi.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => new BookResource($book),
                'message' => 'Draft saved successfully.'
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    private function assertAuthorCanWrite(Request $request): ?JsonResponse
    {
        $user = $request->user();

        if (! $user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap oluşturma ve yayımlama için e-posta adresinizi doğrulamanız gerekir.',
            ], 422);
        }

        if (! $user->isAuthor()) {
            return response()->json([
                'success' => false,
                'message' => 'Kitap işlemleri için önce yazar hesabına geçin (POST /api/user/become-author).',
            ], 422);
        }

        return null;
    }

    /**
     * Autosave / draft sync must not demote a book that is already published.
     */
    private function mergeDraftSavePayload(array $data, int $bookId): array
    {
        $model = \App\Models\Book::find($bookId);
        if ($model && $model->is_published) {
            return $data;
        }

        return array_merge($data, [
            'is_draft' => true,
            'is_published' => false,
        ]);
    }
}

