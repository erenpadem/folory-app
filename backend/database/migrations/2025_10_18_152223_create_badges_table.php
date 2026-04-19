<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // "İlk Yazar", "Kitap Kurdu"
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->string('icon')->nullable(); // frontend’de ikon veya emoji
            $table->enum('type', ['achievement', 'honor'])->default('achievement');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('badges');
    }
};
