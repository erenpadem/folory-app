<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Page\CreatePageUseCase;
use App\Application\UseCases\Page\GetPageUseCase;
use App\Application\UseCases\Page\ListPagesUseCase;
use App\Application\UseCases\Page\UpdatePageUseCase;
use App\Application\UseCases\Page\DeletePageUseCase;
use App\Http\Requests\Page\StorePageRequest;
use App\Http\Requests\Page\UpdatePageRequest;
use App\Http\Resources\PageResource;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function __construct(
        private CreatePageUseCase $createPageUseCase,
        private GetPageUseCase $getPageUseCase,
        private ListPagesUseCase $listPagesUseCase,
        private UpdatePageUseCase $updatePageUseCase,
        private DeletePageUseCase $deletePageUseCase
    ) {}

    public function index(int $sectionId): JsonResponse
    {
        $pages = $this->listPagesUseCase->execute($sectionId);
        
        return response()->json([
            'data' => PageResource::collection($pages)
        ]);
    }

    public function store(StorePageRequest $request, int $sectionId): JsonResponse
    {
        $data = $request->validated();
        $page = $this->createPageUseCase->execute($sectionId, $data);
        
        return response()->json(new PageResource($page), 201);
    }

    public function show(int $sectionId, int $id): JsonResponse
    {
        $page = $this->getPageUseCase->execute($id);

        if (! $page || $page->getSectionId() !== $sectionId) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json(new PageResource($page));
    }

    public function update(UpdatePageRequest $request, int $sectionId, int $id): JsonResponse
    {
        $existing = $this->getPageUseCase->execute($id);
        if (! $existing || $existing->getSectionId() !== $sectionId) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $page = $this->updatePageUseCase->execute($id, $request->validated());

        return response()->json(new PageResource($page));
    }

    public function destroy(int $sectionId, int $id): JsonResponse
    {
        $existing = $this->getPageUseCase->execute($id);
        if (! $existing || $existing->getSectionId() !== $sectionId) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $this->deletePageUseCase->execute($id);

        return response()->json(['message' => 'Page deleted successfully'], 200);
    }
}

