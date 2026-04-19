<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get user by username
     */
    public function getByUsername(string $username): JsonResponse
    {
        $user = User::where('username', $username)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Kullanıcı bulunamadı'
            ], 404);
        }

        $published = (int) $user->books()->where('is_published', true)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'cover_image' => $user->cover_image,
                'bio' => $user->bio,
                'role' => $user->role,
                'is_verified' => $user->is_verified,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'books_total_count' => $published,
                'books_published_count' => $published,
            ]
        ]);
    }

    /**
     * Get user by ID
     */
    public function getById(int $id): JsonResponse
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Kullanıcı bulunamadı'
            ], 404);
        }

        $published = (int) $user->books()->where('is_published', true)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'cover_image' => $user->cover_image,
                'bio' => $user->bio,
                'role' => $user->role,
                'is_verified' => $user->is_verified,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'books_total_count' => $published,
                'books_published_count' => $published,
            ]
        ]);
    }
}

