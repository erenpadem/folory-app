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
        Schema::table('stories', function (Blueprint $table) {
            $table->decimal('rating', 3, 1)->default(0)->after('word_count');
            $table->integer('rating_count')->default(0)->after('rating');
            $table->integer('comment_count')->default(0)->after('rating_count');
            $table->boolean('is_approved')->default(true)->after('is_adult');
            $table->timestamp('approved_at')->nullable()->after('is_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn([
                'rating',
                'rating_count',
                'comment_count',
                'is_approved',
                'approved_at'
            ]);
        });
    }
};
