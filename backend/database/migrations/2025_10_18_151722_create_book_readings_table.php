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
        Schema::create('book_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
        
            $table->foreignId('last_section_id')->nullable()->constrained('sections')->onDelete('set null');
            $table->foreignId('last_page_id')->nullable()->constrained('pages')->onDelete('set null');
        
            $table->decimal('progress_percentage', 5, 2)->default(0);
        
            $table->timestamps();
        
            $table->unique(['user_id', 'book_id']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_readings');
    }
};
