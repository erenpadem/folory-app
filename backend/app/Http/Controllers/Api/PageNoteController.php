<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PageNoteController extends Controller
{
    /**
     * Get all notes for a specific page
     */
    public function index(Request $request, int $pageId): JsonResponse
    {
        $user = $request->user();
        
        $notes = PageNote::where('page_id', $pageId)
            ->where('user_id', $user->id)
            ->orderBy('start_offset')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Create a new page note
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|integer|exists:pages,id',
            'selected_text' => 'required|string',
            'note' => 'nullable|string|max:1000',
            'start_offset' => 'required|integer|min:0',
            'end_offset' => 'required|integer|min:0|gt:start_offset',
            'color' => 'nullable|string|in:yellow,blue,green,pink,orange',
        ], [
            'page_id.required' => 'Sayfa ID zorunludur.',
            'page_id.exists' => 'Geçersiz sayfa ID.',
            'selected_text.required' => 'Seçilen metin zorunludur.',
            'start_offset.required' => 'Başlangıç pozisyonu zorunludur.',
            'end_offset.required' => 'Bitiş pozisyonu zorunludur.',
            'end_offset.gt' => 'Bitiş pozisyonu başlangıç pozisyonundan büyük olmalıdır.',
            'color.in' => 'Geçersiz renk seçimi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if note already exists for this text selection
        $existingNote = PageNote::where('user_id', $user->id)
            ->where('page_id', $request->page_id)
            ->where('start_offset', $request->start_offset)
            ->where('end_offset', $request->end_offset)
            ->first();

        if ($existingNote) {
            // Update existing note
            $existingNote->update([
                'selected_text' => $request->selected_text,
                'note' => $request->note,
                'color' => $request->color ?? 'yellow',
            ]);

            return response()->json([
                'success' => true,
                'data' => $existingNote,
                'message' => 'Not güncellendi.',
            ]);
        }

        // Create new note
        $note = PageNote::create([
            'user_id' => $user->id,
            'page_id' => $request->page_id,
            'selected_text' => $request->selected_text,
            'note' => $request->note,
            'start_offset' => $request->start_offset,
            'end_offset' => $request->end_offset,
            'color' => $request->color ?? 'yellow',
        ]);

        return response()->json([
            'success' => true,
            'data' => $note,
            'message' => 'Not başarıyla oluşturuldu.',
        ], 201);
    }

    /**
     * Update a page note
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        $note = PageNote::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'note' => 'nullable|string|max:1000',
            'color' => 'nullable|string|in:yellow,blue,green,pink,orange',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Doğrulama hatası.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $note->update($request->only(['note', 'color']));

        return response()->json([
            'success' => true,
            'data' => $note,
            'message' => 'Not güncellendi.',
        ]);
    }

    /**
     * Delete a page note
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        
        $note = PageNote::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Not silindi.',
        ]);
    }
}

