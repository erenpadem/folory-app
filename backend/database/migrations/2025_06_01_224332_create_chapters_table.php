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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->cascadeOnDelete();
            $table->integer('chapter_number')->unsigned();
            $table->string('title');
            $table->string('slug');
            $table->text('content');
            $table->integer('word_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->boolean('is_draft')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            $table->unique(['story_id', 'chapter_number']);
            $table->unique(['story_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
