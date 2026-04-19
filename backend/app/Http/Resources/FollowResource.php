<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FollowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->getId(),
            'follower_id' => $this->resource->getFollowerId(),
            'following_id' => $this->resource->getFollowingId(),
            'created_at' => $this->resource->getCreatedAt() ? $this->resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->resource->getUpdatedAt() ? $this->resource->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];
    }
}

