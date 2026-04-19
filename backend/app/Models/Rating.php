<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'score',
    ];

    protected $casts = [
        'score' => 'integer',
    ];

    /**
     * İlişkiler
     */

    // Puan bir kullanıcıya aittir
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Puan bir kitaba aittir
    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
