<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Category\CreateCategoryUseCase;
use App\Application\UseCases\Category\ListCategoriesUseCase;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CreateCategoryUseCase $createCategoryUseCase,
        private ListCategoriesUseCase $listCategoriesUseCase
    ) {}

    public function index(Request $request): JsonResponse
    {
        $activeOnly = $request->get('active_only', false);
        $categories = $this->listCategoriesUseCase->execute($activeOnly);
        
        return response()->json([
            'data' => CategoryResource::collection($categories)
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->createCategoryUseCase->execute($request->validated());
        
        return response()->json(new CategoryResource($category), 201);
    }
}

