<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Category extends Model 
{


    protected $fillable = ['name', 'slug', 'description', 'is_active', 'order'];

    public function stories()
    {
        return $this->hasMany(Story::class);
    }


}