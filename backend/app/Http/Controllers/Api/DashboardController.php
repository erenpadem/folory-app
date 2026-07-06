<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Comment;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated user
     */
    public function stats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get user's books
        $books = Book::where('author_id', $userId)->get();

        // Calculate statistics (is_published is source of truth; aligns with "my books" list)
        $totalBooks = $books->count();
        $publishedBooks = $books->where('is_published', true)->count();
        $draftBooks = $books->where('is_published', false)->count();
        $totalViews = $books->sum('read_count');

        // Get comments on user's books
        $bookIds = $books->pluck('id')->toArray();
        $totalComments = Comment::whereIn('book_id', $bookIds)
            ->whereNull('parent_id') // Only top-level comments
            ->count();

        // Get ratings for user's books
        $ratings = Rating::whereIn('book_id', $bookIds)->get();
        $totalRatings = $ratings->count();
        $averageRating = $totalRatings > 0 
            ? round($ratings->avg('score'), 1) 
            : 0;

        // Get recent activity
        $recentComments = Comment::whereIn('book_id', $bookIds)
            ->whereNull('parent_id')
            ->with(['user', 'book'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => $comment->user ? [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'username' => $comment->user->username,
                        'avatar' => $comment->user->avatar,
                    ] : null,
                    'book' => $comment->book ? [
                        'id' => $comment->book->id,
                        'title' => $comment->book->title,
                        'slug' => $comment->book->slug,
                    ] : null,
                    'created_at' => $comment->created_at ? $comment->created_at->format('Y-m-d H:i:s') : null,
                ];
            })
            ->filter(function ($comment) {
                return $comment['user'] !== null && $comment['book'] !== null;
            })
            ->values();

        $recentRatings = Rating::whereIn('book_id', $bookIds)
            ->with(['user', 'book'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'score' => $rating->score,
                    'user' => $rating->user ? [
                        'id' => $rating->user->id,
                        'name' => $rating->user->name,
                        'username' => $rating->user->username,
                        'avatar' => $rating->user->avatar,
                    ] : null,
                    'book' => $rating->book ? [
                        'id' => $rating->book->id,
                        'title' => $rating->book->title,
                        'slug' => $rating->book->slug,
                    ] : null,
                    'created_at' => $rating->created_at ? $rating->created_at->format('Y-m-d H:i:s') : null,
                ];
            })
            ->filter(function ($rating) {
                return $rating['user'] !== null && $rating['book'] !== null;
            })
            ->values();

        // Books by status
        $booksByStatus = [
            'published' => $publishedBooks,
            'draft' => $draftBooks,
            'total' => $totalBooks,
        ];

        // Views over time (last 30 days)
        $viewsOverTime = Book::where('author_id', $userId)
            ->select(
                DB::raw('DATE(updated_at) as date'),
                DB::raw('SUM(read_count) as views')
            )
            ->where('updated_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'views' => (int) $item->views,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'total_books' => $totalBooks,
                    'published_books' => $publishedBooks,
                    'draft_books' => $draftBooks,
                    'total_views' => $totalViews,
                    'total_comments' => $totalComments,
                    'total_ratings' => $totalRatings,
                    'average_rating' => $averageRating,
                ],
                'books_by_status' => $booksByStatus,
                'recent_comments' => $recentComments,
                'recent_ratings' => $recentRatings,
                'views_over_time' => $viewsOverTime,
            ],
        ]);
    }
}
