<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'content',
        'order',
    ];

    /**
     * İlişkiler
     */

    // Bir sayfa bir bölüme (section) aittir
    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
