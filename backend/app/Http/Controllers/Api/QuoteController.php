<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuoteController extends Controller
{
    /**
     * Okuma sırasında kaydedilen metin vurguları (page_notes), profil "Alıntılar" sekmesi için.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = (int) $request->query('user_id');
        $viewerId = $request->user()?->id;
        $isViewerOwner = $viewerId !== null && $viewerId === $userId;

        $notes = PageNote::query()
            ->where('user_id', $userId)
            ->whereHas('page.section.book', function ($q) use ($isViewerOwner) {
                if (! $isViewerOwner) {
                    $q->where('is_published', true)->where('is_draft', false);
                }
            })
            ->with(['page.section.book:id,title,slug'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (PageNote $note) {
                $book = $note->page?->section?->book;

                return [
                    'id' => $note->id,
                    'content' => $note->selected_text,
                    'note' => $note->note,
                    'created_at' => $note->created_at,
                    'book' => $book ? [
                        'id' => $book->id,
                        'title' => $book->title,
                        'slug' => $book->slug,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }
}
