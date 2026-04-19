<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bookmark extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'page_id',
    ];

    /**
     * İlişkiler
     */

    // Bookmark bir kullanıcıya aittir
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Bookmark bir sayfaya aittir
    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
