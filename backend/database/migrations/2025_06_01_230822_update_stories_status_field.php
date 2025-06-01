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
            // Eski status alanını sil (eğer varsa)
            $table->dropColumn('status');

            // Yeni enum status alanını ekle
            $table->enum('status', [
                'draft',      // Taslak
                'pending',    // İnceleme Bekliyor
                'published',  // Yayında
                'archived',   // Arşivlendi
                'rejected'    // Reddedildi
            ])->default('draft')->after('is_adult');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropColumn(['status']);
            // Eski status alanını geri eklemek isterseniz buraya ekleyin
        });
    }
};
