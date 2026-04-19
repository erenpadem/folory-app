<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'page_id',
        'selected_text',
        'note',
        'start_offset',
        'end_offset',
        'color',
    ];

    protected $casts = [
        'start_offset' => 'integer',
        'end_offset' => 'integer',
    ];

    /**
     * İlişkiler
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}

