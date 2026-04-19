<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('comments')) {
            // comments tablosu yoksa bu migration'ı atla
            return;
        }

        Schema::table('comments', function (Blueprint $table) {
            // Add pages and authors as JSON fields for tagging
            $table->json('pages')->nullable()->after('sections'); // ["page_id1","page_id2"] @page için
            $table->json('authors')->nullable()->after('pages'); // ["author_id1","author_id2"] @author için
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->dropColumn(['pages', 'authors']);
        });
    }
};

