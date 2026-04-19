<?php

// database/migrations/2025_09_22_000001_create_follows_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('follower_id'); // takip eden
            $table->unsignedBigInteger('following_id'); // takip edilen
            $table->timestamps();

            $table->unique(['follower_id','following_id']); // duplicate takip önlenir

            $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('following_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('follows');
    }
};
