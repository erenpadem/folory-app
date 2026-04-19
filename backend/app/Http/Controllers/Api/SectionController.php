<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Section\CreateSectionUseCase;
use App\Application\UseCases\Section\GetSectionUseCase;
use App\Application\UseCases\Section\ListSectionsUseCase;
use App\Application\UseCases\Section\UpdateSectionUseCase;
use App\Application\UseCases\Section\DeleteSectionUseCase;
use App\Application\UseCases\Section\ReorderSectionsUseCase;
use App\Http\Requests\Section\StoreSectionRequest;
use App\Http\Requests\Section\UpdateSectionRequest;
use App\Http\Resources\SectionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function __construct(
        private CreateSectionUseCase $createSectionUseCase,
        private GetSectionUseCase $getSectionUseCase,
        private ListSectionsUseCase $listSectionsUseCase,
        private UpdateSectionUseCase $updateSectionUseCase,
        private DeleteSectionUseCase $deleteSectionUseCase,
        private ReorderSectionsUseCase $reorderSectionsUseCase
    ) {}

    public function index(int $bookId): JsonResponse
    {
        $sections = $this->listSectionsUseCase->execute($bookId);
        
        return response()->json([
            'data' => SectionResource::collection($sections)
        ]);
    }

    public function store(StoreSectionRequest $request, int $bookId): JsonResponse
    {
        $data = $request->validated();
        if (isset($data['title'])) {
            $data['title'] = trim(preg_replace('/\s+/', ' ', $data['title']));
        }

        $created = $this->createSectionUseCase->execute($bookId, $data);
        $id = $created->getId();
        if ($id === null) {
            return response()->json(['message' => 'Bölüm oluşturulamadı'], 500);
        }

        $section = $this->getSectionUseCase->execute($id);
        return response()->json(new SectionResource($section), 201);
    }

    public function show(int $bookId, int $id): JsonResponse
    {
        $section = $this->getSectionUseCase->execute($id);

        if (! $section || $section->getBookId() !== $bookId) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        return response()->json(new SectionResource($section));
    }

    public function update(UpdateSectionRequest $request, int $bookId, int $id): JsonResponse
    {
        $existing = $this->getSectionUseCase->execute($id);
        if (! $existing || $existing->getBookId() !== $bookId) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $section = $this->updateSectionUseCase->execute($id, $request->validated());

        return response()->json(new SectionResource($section));
    }

    public function destroy(int $bookId, int $id): JsonResponse
    {
        $existing = $this->getSectionUseCase->execute($id);
        if (! $existing || $existing->getBookId() !== $bookId) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        $this->deleteSectionUseCase->execute($id);

        return response()->json(['message' => 'Section deleted successfully'], 200);
    }

    public function reorder(Request $request, int $bookId): JsonResponse
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:sections,id',
            'sections.*.order' => 'required|integer|min:0',
        ]);

        $sectionOrders = [];
        foreach ($request->sections as $section) {
            $sectionOrders[$section['id']] = $section['order'];
        }

        $this->reorderSectionsUseCase->execute($bookId, $sectionOrders);
        
        return response()->json(['message' => 'Sections reordered successfully'], 200);
    }
}

