<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookReading;
use App\Models\Page;
use App\Models\Section;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $readings = BookReading::where('user_id', $request->user()->id)
            ->with(['book.author', 'book.category'])
            ->latest()
            ->paginate(15);

        // Transform to BookResource collection (extracting books from readings)
        $books = $readings->map(function ($reading) {
            $book = $reading->book;
            // Attach reading progress to book object if needed, 
            // but BookResource might not handle it. 
            // For now, just return the books.
            return $book;
        });

        // We need to return BookResources. 
        // Note: This loses the 'reading_progress' info unless we modify BookResource 
        // or return a specific LibraryResource.
        // For MVP, user just wants "My Library".
        
        return response()->json([
            'data' => BookResource::collection($books),
            'meta' => [
                'current_page' => $readings->currentPage(),
                'last_page' => $readings->lastPage(),
                'per_page' => $readings->perPage(),
                'total' => $readings->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $reading = BookReading::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'book_id' => $request->input('book_id'),
            ],
            [
                'progress_percentage' => 0,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Kitap kitaplığınıza eklendi.',
            'data' => $reading
        ]);
    }

    public function destroy(int $bookId, Request $request): JsonResponse
    {
        $deleted = BookReading::where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Kitap kitaplığınızdan çıkarıldı.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Kitap kitaplığınızda bulunamadı.'
        ], 404);
    }
    
    public function check(int $bookId, Request $request): JsonResponse
    {
        $exists = BookReading::where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->exists();
            
        return response()->json([
            'is_saved' => $exists
        ]);
    }

    /**
     * Son kayıtlı okuma konumu (kitap okuyucu / devam et).
     */
    public function reading(int $bookId, Request $request): JsonResponse
    {
        $reading = BookReading::where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->first();

        if (!$reading || !$reading->last_section_id || !$reading->last_page_id) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'last_section_id' => (int) $reading->last_section_id,
                'last_page_id' => (int) $reading->last_page_id,
                'progress_percentage' => (float) $reading->progress_percentage,
            ],
        ]);
    }

    /**
     * Okuma ilerlemesini kaydet (giriş yapmış kullanıcı).
     */
    public function updateProgress(int $bookId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'last_section_id' => 'required|integer|exists:sections,id',
            'last_page_id' => 'required|integer|exists:pages,id',
            'progress_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $section = Section::where('id', $validated['last_section_id'])
            ->where('book_id', $bookId)
            ->first();

        if (!$section) {
            return response()->json(['message' => 'Bu bölüm bu kitaba ait değil.'], 422);
        }

        $page = Page::where('id', $validated['last_page_id'])
            ->where('section_id', $section->id)
            ->first();

        if (!$page) {
            return response()->json(['message' => 'Bu sayfa bu bölüme ait değil.'], 422);
        }

        $reading = BookReading::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'book_id' => $bookId,
            ],
            [
                'last_section_id' => $validated['last_section_id'],
                'last_page_id' => $validated['last_page_id'],
                'progress_percentage' => round((float) $validated['progress_percentage'], 2),
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'last_section_id' => (int) $reading->last_section_id,
                'last_page_id' => (int) $reading->last_page_id,
                'progress_percentage' => (float) $reading->progress_percentage,
            ],
        ]);
    }

    /**
     * Kayıtlı okuma konumunu sıfırla (kitap detay — geçmişi temizle).
     */
    public function clearProgress(int $bookId, Request $request): JsonResponse
    {
        BookReading::where('user_id', $request->user()->id)
            ->where('book_id', $bookId)
            ->update([
                'last_section_id' => null,
                'last_page_id' => null,
                'progress_percentage' => 0,
            ]);

        return response()->json(['success' => true]);
    }
}
