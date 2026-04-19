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
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->string('title');
            $table->string('short_description')->nullable();
            $table->string('cover')->nullable();
            $table->integer('read_count')->default(0);
            $table->integer('total_page')->default(0);
        
            // Yeni alanlar
            $table->boolean('is_adult')->default(false); // +18 yaş kısıtlaması
            $table->boolean('is_draft')->default(true);
            $table->boolean('is_published')->default(false);
        
            $table->timestamps();
        
            $table->unique(['author_id', 'title']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
