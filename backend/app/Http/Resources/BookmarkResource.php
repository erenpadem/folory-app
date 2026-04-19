<?php

namespace App\Http\Resources;

use App\Models\Bookmark as BookmarkModel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookmarkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        if ($this->resource instanceof BookmarkModel) {
            $m = $this->resource;

            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'page_id' => $m->page_id,
                'created_at' => $m->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $m->updated_at?->format('Y-m-d H:i:s'),
            ];
        }

        return [
            'id' => $this->resource->getId(),
            'user_id' => $this->resource->getUserId(),
            'page_id' => $this->resource->getPageId(),
            'created_at' => $this->resource->getCreatedAt() ? $this->resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->resource->getUpdatedAt() ? $this->resource->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];
    }
}

