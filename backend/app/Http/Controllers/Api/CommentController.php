<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Comment\CreateCommentUseCase;
use App\Domain\Comment\Repositories\CommentRepositoryInterface;
use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        private CreateCommentUseCase $createCommentUseCase,
        private CommentRepositoryInterface $commentRepository,
        private NotificationService $notificationService
    ) {}

    public function index(int $bookId): JsonResponse
    {
        $comments = $this->commentRepository->findByBookId($bookId, 15);

        $commentEntities = collect($comments->items())->map(function ($model) {
            try {
                return $this->commentRepository->findById($model->id);
            } catch (\Exception $e) {
                \Log::warning("Failed to convert comment model to entity: " . $e->getMessage());
                return null;
            }
        })->filter();

        $data = $commentEntities
            ->map(fn ($entity) => $this->commentToArrayWithReplies($entity))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ]
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function commentToArrayWithReplies(\App\Domain\Comment\Entities\Comment $entity): array
    {
        $arr = (new CommentResource($entity))->resolve(request());
        $replies = $this->commentRepository->findByParentId($entity->getId());
        $arr['replies'] = collect($replies)
            ->map(fn ($reply) => $this->commentToArrayWithReplies($reply))
            ->values()
            ->all();

        return $arr;
    }

    /**
     * Get comments by user ID
     */
    public function getUserComments(int $userId): JsonResponse
    {
        try {
            $comments = $this->commentRepository->findByUserId($userId, 15);
            
            // Convert paginated models to entities for CommentResource
            $commentEntities = collect($comments->items())->map(function ($model) {
                try {
                    return $this->commentRepository->findById($model->id);
                } catch (\Exception $e) {
                    \Log::warning("Failed to convert comment model to entity: " . $e->getMessage());
                    return null;
                }
            })->filter();
            
            return response()->json([
                'success' => true,
                'data' => CommentResource::collection($commentEntities),
                'meta' => [
                    'current_page' => $comments->currentPage(),
                    'last_page' => $comments->lastPage(),
                    'per_page' => $comments->perPage(),
                    'total' => $comments->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching user comments: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Yorumlar yüklenirken bir hata oluştu',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $comment = $this->createCommentUseCase->execute(
            $request->user()->id,
            $data['book_id'],
            $data['content'],
            $data['parent_id'] ?? null
        );
        
        // If this is a reply, notify the parent comment author
        if ($data['parent_id'] ?? null) {
            $parentComment = $this->commentRepository->findById($data['parent_id']);
            if ($parentComment) {
                $this->notificationService->notifyCommentReply($comment, $parentComment);
            }
        } else {
            // If this is a top-level comment, notify the book author
            $this->notificationService->notifyBookComment($comment);
        }

        // Parse and notify mentions (@user{id} or @author{id})
        preg_match_all('/@(author|user)\{(\d+)\}/', $data['content'], $matches);
        if (!empty($matches[2])) {
            $mentionedIds = array_unique($matches[2]);
            foreach ($mentionedIds as $userId) {
                $this->notificationService->notifyMention($comment, (int)$userId);
            }
        }
        
        return response()->json(new CommentResource($comment), 201);
    }

    /**
     * Toggle like on a comment
     */
    public function toggleLike(int $id, Request $request): JsonResponse
    {
        try {
            $comment = \App\Models\Comment::findOrFail($id);
            $user = $request->user();

            if ($comment->isLikedBy($user->id)) {
                // Unlike
                $comment->likes()->detach($user->id);
                $liked = false;
            } else {
                // Like
                $comment->likes()->attach($user->id);
                $liked = true;
                
                // Notify comment owner about the like
                $this->notificationService->notifyCommentLike($id, $user->id);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'liked' => $liked,
                    'likes_count' => $comment->likesCount(),
                ],
                'message' => $liked ? 'Yorum beğenildi' : 'Beğeni kaldırıldı',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error toggling comment like: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Beğeni işlemi başarısız',
            ], 500);
        }
    }

    /**
     * Unlike a comment
     */
    public function unlike(int $id, Request $request): JsonResponse
    {
        try {
            $comment = \App\Models\Comment::findOrFail($id);
            $user = $request->user();

            $comment->likes()->detach($user->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'liked' => false,
                    'likes_count' => $comment->likesCount(),
                ],
                'message' => 'Beğeni kaldırıldı',
            ]);
        } catch (\Exception $e) {
            \Log::error('Error unliking comment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Beğeni kaldırma işlemi başarısız',
            ], 500);
        }
    }
}

