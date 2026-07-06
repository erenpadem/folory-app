<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookLike;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BookLikeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $likes = BookLike::where('user_id', $request->user()->id)
            ->with(['book.author', 'book.category'])
            ->latest()
            ->paginate(15);

        $books = $likes->map(function ($like) {
            return $like->book;
        });

        return response()->json([
            'data' => BookResource::collection($books),
            'meta' => [
                'current_page' => $likes->currentPage(),
                'last_page' => $likes->lastPage(),
                'per_page' => $likes->perPage(),
                'total' => $likes->total(),
            ]
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $userId = $request->user()->id;
        $bookId = $request->input('book_id');

        $like = BookLike::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();

        if ($like) {
            $like->delete();
            return response()->json([
                'success' => true,
                'is_liked' => false,
                'message' => 'Beğeni kaldırıldı.'
            ]);
        }

        $book = Book::findOrFail($bookId);
        if ((int) $book->author_id === $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Kendi kitabınızı beğenemezsiniz.',
            ], 403);
        }

        BookLike::create([
            'user_id' => $userId,
            'book_id' => $bookId,
        ]);
        return response()->json([
            'success' => true,
            'is_liked' => true,
            'message' => 'Kitap beğenildi.'
        ]);
    }

    public function check(int $bookId, Request $request): JsonResponse
    {
        $book = Book::find($bookId);
        if ($book && (int) $book->author_id === (int) $request->user()->id) {
            return response()->json([
                'is_liked' => false,
            ]);
        }

        $exists = BookLike::where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->exists();
            
        return response()->json([
            'is_liked' => $exists
        ]);
    }
}
