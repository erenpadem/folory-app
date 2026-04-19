<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->getId(),
            'book_id' => $this->resource->getBookId(),
            'title' => $this->resource->getTitle(),
            'order' => $this->resource->getOrder(),
            'total_page' => $this->resource->getTotalPage(),
            'is_visible' => $this->resource->isVisible(),
            'created_at' => $this->resource->getCreatedAt() ? $this->resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->resource->getUpdatedAt() ? $this->resource->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];
    }
}

