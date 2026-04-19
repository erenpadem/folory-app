<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Rating as RatingModel;

class RatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Try to get user from the model if available (when loaded with eager loading)
        $user = null;
        if ($this->resource->getId()) {
            // Try to get the model from cache or load it
            $ratingModel = RatingModel::with('user')->find($this->resource->getId());
            if ($ratingModel && $ratingModel->relationLoaded('user') && $ratingModel->user) {
                $user = [
                    'id' => $ratingModel->user->id,
                    'name' => $ratingModel->user->name,
                    'avatar' => $ratingModel->user->avatar,
                ];
            }
        }
        
        return [
            'id' => $this->resource->getId(),
            'user_id' => $this->resource->getUserId(),
            'book_id' => $this->resource->getBookId(),
            'score' => $this->resource->getScore(),
            'user' => $user,
            'created_at' => $this->resource->getCreatedAt() ? $this->resource->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updated_at' => $this->resource->getUpdatedAt() ? $this->resource->getUpdatedAt()->format('Y-m-d H:i:s') : null,
        ];
    }
}

