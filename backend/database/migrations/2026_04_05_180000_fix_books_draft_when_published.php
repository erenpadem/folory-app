<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('books')->where('is_published', true)->update(['is_draft' => false]);
    }

    public function down(): void
    {
        // No safe inverse: we cannot know prior inconsistent is_draft values.
    }
};
