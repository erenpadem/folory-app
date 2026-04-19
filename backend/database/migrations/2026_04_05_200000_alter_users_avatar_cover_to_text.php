<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Base64 kapak ve avatar görselleri VARCHAR(255) sınırını aşar.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE TEXT');
            DB::statement('ALTER TABLE users ALTER COLUMN cover_image TYPE TEXT');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE users MODIFY avatar TEXT NULL');
            DB::statement('ALTER TABLE users MODIFY cover_image TEXT NULL');
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN avatar TYPE VARCHAR(255)');
            DB::statement('ALTER TABLE users ALTER COLUMN cover_image TYPE VARCHAR(255)');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE users MODIFY avatar VARCHAR(255) NULL');
            DB::statement('ALTER TABLE users MODIFY cover_image VARCHAR(255) NULL');
        }
    }
};
