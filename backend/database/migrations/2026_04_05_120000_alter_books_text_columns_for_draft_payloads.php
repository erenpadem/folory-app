<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Draft saves send base64 cover images and longer descriptions than VARCHAR(255) allows.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE books ALTER COLUMN short_description TYPE TEXT');
            DB::statement('ALTER TABLE books ALTER COLUMN cover TYPE TEXT');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE books MODIFY short_description TEXT NULL');
            DB::statement('ALTER TABLE books MODIFY cover TEXT NULL');
        } elseif ($driver === 'sqlite') {
            // SQLite: recreate pattern is heavy; local dev often uses pgsql/mysql
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE books ALTER COLUMN short_description TYPE VARCHAR(255)');
            DB::statement('ALTER TABLE books ALTER COLUMN cover TYPE VARCHAR(255)');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE books MODIFY short_description VARCHAR(255) NULL');
            DB::statement('ALTER TABLE books MODIFY cover VARCHAR(255) NULL');
        }
    }
};
