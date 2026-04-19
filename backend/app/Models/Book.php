<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'author_id',
        'category_id',
        'title',
        'slug',
        'short_description',
        'cover',
        'read_count',
        'total_page',
        'is_adult',
        'is_draft',
        'is_published',
    ];

    // Auto-slug generation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($book) {
            if (empty($book->slug)) {
                $book->slug = static::generateUniqueSlug($book->title);
            }
        });

        static::updating(function ($book) {
            // If title changed, update slug
            if ($book->isDirty('title') && empty($book->slug)) {
                $book->slug = static::generateUniqueSlug($book->title, $book->id);
            }
        });
    }

    /**
     * Generate unique slug from title
     */
    protected static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        // Normalize Turkish characters before slugging to avoid missing letters like "ı"
        $map = [
            'ı' => 'i', 'İ' => 'I',
            'ş' => 's', 'Ş' => 'S',
            'ç' => 'c', 'Ç' => 'C',
            'ğ' => 'g', 'Ğ' => 'G',
            'ü' => 'u', 'Ü' => 'U',
            'ö' => 'o', 'Ö' => 'O',
        ];
        $normalizedTitle = strtr($title, $map);
        // Create slug (fallback to 'tr' locale if available)
        $slug = Str::slug($normalizedTitle, '-');
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get route key name for model binding
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $casts = [
        'is_adult' => 'boolean',
        'is_draft' => 'boolean',
        'is_published' => 'boolean',
    ];

    // 🔹 Yazar ilişkisi
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // 🔹 Kategori ilişkisi
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // 🔹 Bölümler (sections)
    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    // 🔹 Sayfalar (tüm kitabın sayfaları - sections üzerinden)
    public function pages()
    {
        return $this->hasManyThrough(Page::class, Section::class);
    }

    // 🔹 Okuma takibi
    public function readings()
    {
        return $this->hasMany(BookReading::class);
    }

    // 🔹 Yorumlar
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    // 🔹 Puanlar
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    // 🔹 Scope örneği: yayımlanmış kitaplar
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    // 🔹 Okuma oranı hesaplama helper’ı
    public function readingProgressFor(User $user)
    {
        $reading = $this->readings()->where('user_id', $user->id)->first();
        if (!$reading || $this->total_page === 0) {
            return 0;
        }
        return round(($reading->current_page / $this->total_page) * 100, 2);
    }
}
