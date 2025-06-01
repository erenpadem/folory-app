<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Story ilişkisini nullable yapıp sonradan constraint ekleyelim
            $table->unsignedBigInteger('story_id');
            $table->foreignId('chapter_id')->nullable()->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'story_id', 'chapter_id']);
        });
        
        // Stories tablosu oluştuktan sonra foreign key ekleyelim
        Schema::table('bookmarks', function (Blueprint $table) {
            $table->foreign('story_id')->references('id')->on('stories')->onDelete('cascade');
        });
    }
    
};
