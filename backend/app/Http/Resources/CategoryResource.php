<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Category as CategoryModel;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Handle both Category entity and CategoryModel
        if ($this->resource instanceof CategoryModel) {
            $model = $this->resource;
            return [
                'id' => $model->id,
                'name' => $model->name,
                'slug' => $model->slug,
                'description' => $model->description,
                'is_active' => $model->is_active,
                'order' => $model->order,
                'created_at' => $model->created_at ? $model->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $model->updated_at ? $model->updated_at->format('Y-m-d H:i:s') : null,
            ];
        } else {
            // Category entity
            $category = $this->resource;
            return [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'slug' => $category->getSlug(),
                'description' => $category->getDescription(),
                'is_active' => $category->isActive(),
                'order' => $category->getOrder(),
                'created_at' => $category->getCreatedAt() ? $category->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updated_at' => $category->getUpdatedAt() ? $category->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }
    }
}

