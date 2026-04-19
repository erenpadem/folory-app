<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Bookmark\CreateBookmarkUseCase;
use App\Application\UseCases\Bookmark\DeleteBookmarkUseCase;
use App\Domain\Bookmark\Repositories\BookmarkRepositoryInterface;
use App\Http\Requests\Bookmark\StoreBookmarkRequest;
use App\Http\Resources\BookmarkResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function __construct(
        private CreateBookmarkUseCase $createBookmarkUseCase,
        private DeleteBookmarkUseCase $deleteBookmarkUseCase,
        private BookmarkRepositoryInterface $bookmarkRepository
    ) {}

    public function check(int $pageId, Request $request): JsonResponse
    {
        $existing = $this->bookmarkRepository->findByUserIdAndPageId(
            $request->user()->id,
            $pageId
        );

        return response()->json([
            'is_bookmarked' => $existing !== null,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $bookmarks = $this->bookmarkRepository->findByUserId($request->user()->id, 15);
        
        return response()->json([
            'data' => BookmarkResource::collection($bookmarks->items()),
            'meta' => [
                'current_page' => $bookmarks->currentPage(),
                'last_page' => $bookmarks->lastPage(),
                'per_page' => $bookmarks->perPage(),
                'total' => $bookmarks->total(),
            ]
        ]);
    }

    public function store(StoreBookmarkRequest $request): JsonResponse
    {
        $data = $request->validated();
        $bookmark = $this->createBookmarkUseCase->execute(
            $request->user()->id,
            $data['page_id']
        );
        
        return response()->json(new BookmarkResource($bookmark), 201);
    }

    public function destroy(int $pageId, Request $request): JsonResponse
    {
        $this->deleteBookmarkUseCase->execute($request->user()->id, $pageId);
        
        return response()->json(['message' => 'Bookmark deleted successfully'], 200);
    }
}

