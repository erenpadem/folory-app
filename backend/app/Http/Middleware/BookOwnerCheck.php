<?php

namespace App\Http\Middleware;

use App\Domain\Book\Repositories\BookRepositoryInterface;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BookOwnerCheck
{
    public function __construct(
        private BookRepositoryInterface $bookRepository
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $slugOrId = $request->route('slugOrId') ?? $request->route('id') ?? $request->route('book');

        $book = null;
        if ($slugOrId !== null && $slugOrId !== '') {
            if (is_numeric($slugOrId)) {
                $book = $this->bookRepository->findById((int) $slugOrId);
            } else {
                $book = $this->bookRepository->findBySlug((string) $slugOrId);
            }
        }

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book not found.'
            ], 404);
        }

        if (auth()->id() !== $book->getAuthorId()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to perform this action.'
            ], 403);
        }

        return $next($request);
    }
}

