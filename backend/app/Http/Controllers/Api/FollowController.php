<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Follow\CreateFollowUseCase;
use App\Application\UseCases\Follow\UnfollowUseCase;
use App\Domain\Follow\Repositories\FollowRepositoryInterface;
use App\Http\Requests\Follow\StoreFollowRequest;
use App\Http\Resources\FollowResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(
        private CreateFollowUseCase $createFollowUseCase,
        private UnfollowUseCase $unfollowUseCase,
        private FollowRepositoryInterface $followRepository
    ) {}

    public function check(int $followingId, Request $request): JsonResponse
    {
        $exists = $this->followRepository->findByFollowerIdAndFollowingId(
            $request->user()->id,
            $followingId
        ) !== null;

        return response()->json(['is_following' => $exists]);
    }

    public function followers(int $userId): JsonResponse
    {
        $followers = $this->followRepository->findByFollowingId($userId, 15);

        $entities = collect($followers->items())
            ->map(fn ($model) => $this->followRepository->findById($model->id))
            ->filter();

        return response()->json([
            'data' => FollowResource::collection($entities),
            'meta' => [
                'current_page' => $followers->currentPage(),
                'last_page' => $followers->lastPage(),
                'per_page' => $followers->perPage(),
                'total' => $followers->total(),
            ],
        ]);
    }

    public function following(int $userId): JsonResponse
    {
        $following = $this->followRepository->findByFollowerId($userId, 15);

        $entities = collect($following->items())
            ->map(fn ($model) => $this->followRepository->findById($model->id))
            ->filter();

        return response()->json([
            'data' => FollowResource::collection($entities),
            'meta' => [
                'current_page' => $following->currentPage(),
                'last_page' => $following->lastPage(),
                'per_page' => $following->perPage(),
                'total' => $following->total(),
            ],
        ]);
    }

    public function store(StoreFollowRequest $request): JsonResponse
    {
        $data = $request->validated();
        $follow = $this->createFollowUseCase->execute(
            $request->user()->id,
            $data['following_id']
        );
        
        return response()->json(new FollowResource($follow), 201);
    }

    public function destroy(int $followingId, Request $request): JsonResponse
    {
        $this->unfollowUseCase->execute($request->user()->id, $followingId);
        
        return response()->json(['message' => 'Unfollowed successfully'], 200);
    }
}

