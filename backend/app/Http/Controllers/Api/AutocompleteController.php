<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\User;
use App\Models\Section;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutocompleteController extends Controller
{
    /**
     * Get autocomplete suggestions for mentions
     * Supports: @book, @author, @section, @page
     */
    public function mentions(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all'); // all, book, author, section, page
        $bookId = $request->get('book_id'); // Required for section and page

        $results = [
            'books' => [],
            'authors' => [],
            'sections' => [],
            'pages' => [],
        ];

        // Search books
        if ($type === 'all' || $type === 'book') {
            $books = Book::where('title', 'LIKE', "%{$query}%")
                ->orWhere('short_description', 'LIKE', "%{$query}%")
                ->limit(5)
                ->get(['id', 'title', 'slug', 'cover']);

            $results['books'] = $books->map(function ($book) {
                return [
                    'id' => $book->id,
                    'title' => $book->title,
                    'slug' => $book->slug,
                    'cover' => $book->cover,
                    'type' => 'book',
                    'display' => $book->title,
                ];
            });
        }

        // Search authors
        if ($type === 'all' || $type === 'author') {
            $authors = User::where('role', 'author')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'LIKE', "%{$query}%")
                      ->orWhere('email', 'LIKE', "%{$query}%");
                })
                ->limit(5)
                ->get(['id', 'name', 'avatar']);

            $results['authors'] = $authors->map(function ($author) {
                return [
                    'id' => $author->id,
                    'name' => $author->name,
                    'avatar' => $author->avatar,
                    'type' => 'author',
                    'display' => $author->name,
                ];
            });
        }

        // Search sections (requires book_id)
        if ($bookId && ($type === 'all' || $type === 'section')) {
            $sections = Section::where('book_id', $bookId)
                ->where('title', 'LIKE', "%{$query}%")
                ->limit(5)
                ->get(['id', 'title', 'order']);

            $results['sections'] = $sections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'order' => $section->order,
                    'type' => 'section',
                    'display' => $section->title,
                ];
            });
        }

        // Search pages (requires book_id)
        if ($bookId && ($type === 'all' || $type === 'page')) {
            $pages = Page::whereHas('section', function ($q) use ($bookId) {
                    $q->where('book_id', $bookId);
                })
                ->limit(10) // More pages might be needed
                ->with('section:id,title')
                ->get(['id', 'section_id', 'order']);

            $results['pages'] = $pages->map(function ($page) {
                return [
                    'id' => $page->id,
                    'section_id' => $page->section_id,
                    'section_title' => $page->section->title ?? '',
                    'order' => $page->order,
                    'type' => 'page',
                    'display' => $page->section->title ? "{$page->section->title} - Sayfa {$page->order}" : "Sayfa {$page->order}",
                ];
            });
        }

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }
}

