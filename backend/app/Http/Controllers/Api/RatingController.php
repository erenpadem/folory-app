<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Rating\CreateRatingUseCase;
use App\Domain\Rating\Repositories\RatingRepositoryInterface;
use App\Http\Requests\Rating\StoreRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Rating as RatingModel;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function __construct(
        private CreateRatingUseCase $createRatingUseCase,
        private RatingRepositoryInterface $ratingRepository,
        private NotificationService $notificationService
    ) {}

    /**
     * Get ratings for a specific book
     */
    public function index(Request $request, int $bookId): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $ratings = $this->ratingRepository->findByBookId($bookId, $perPage);
        $averageRating = $this->ratingRepository->getAverageRatingByBookId($bookId);
        
        // Convert paginated model results to entities
        $ratingEntities = collect($ratings->items())->map(function ($model) {
            return $this->ratingRepository->toEntity($model);
        })->filter();
        
        return response()->json([
            'success' => true,
            'data' => RatingResource::collection($ratingEntities),
            'average_rating' => $averageRating > 0 ? round($averageRating, 1) : null,
            'meta' => [
                'current_page' => $ratings->currentPage(),
                'last_page' => $ratings->lastPage(),
                'per_page' => $ratings->perPage(),
                'total' => $ratings->total(),
            ],
        ]);
    }

    /**
     * Authenticated user's rating for a book (if any).
     */
    public function mine(Request $request, int $bookId): JsonResponse
    {
        $rating = $this->ratingRepository->findByUserIdAndBookId($request->user()->id, $bookId);

        return response()->json([
            'success' => true,
            'data' => $rating ? ['score' => $rating->getScore()] : null,
        ]);
    }

    public function store(StoreRatingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $rating = $this->createRatingUseCase->execute(
            $request->user()->id,
            $data['book_id'],
            $data['score']
        );
        
        // Notify book author about the rating
        $this->notificationService->notifyBookRating($rating);
        
        return response()->json(new RatingResource($rating), 201);
    }
}

