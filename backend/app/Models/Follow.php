<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    use HasFactory;

    protected $fillable = [
        'follower_id',
        'following_id',
    ];

    /**
     * İlişkiler
     */

    // Takip eden kullanıcı
    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    // Takip edilen kullanıcı
    public function following()
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}
