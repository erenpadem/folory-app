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
        if (!Schema::hasTable('page_notes')) {
        Schema::create('page_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->unsignedBigInteger('user_id')->nullable();

            $table->text('selected_text'); // Seçilen metin
            $table->text('note')->nullable(); // Kullanıcının notu
            $table->integer('start_offset'); // Metin içindeki başlangıç pozisyonu
            $table->integer('end_offset'); // Metin içindeki bitiş pozisyonu
            $table->string('color')->default('yellow'); // Vurgu rengi (yellow, blue, green, etc.)
            $table->timestamps();
            // Aynı kullanıcı aynı sayfada aynı metni birden fazla kez notlayamaz
            $table->unique(['user_id', 'page_id', 'start_offset', 'end_offset']);
        });
    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_notes');
    }
};

