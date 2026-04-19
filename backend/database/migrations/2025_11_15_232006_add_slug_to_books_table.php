<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('title');
        });

        // Generate slugs for existing books (portable: REGEXP_REPLACE is not available in SQLite)
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'sqlite') {
            foreach (DB::table('books')->whereNull('slug')->get() as $row) {
                $base = Str::slug((string) $row->title) ?: 'book';
                $slug = $base;
                $n = 0;
                while (
                    DB::table('books')->where('slug', $slug)->where('id', '!=', $row->id)->exists()
                ) {
                    $n++;
                    $slug = $base.'-'.$n;
                }
                DB::table('books')->where('id', $row->id)->update(['slug' => $slug]);
            }
        } else {
            DB::statement('UPDATE books SET slug = LOWER(REGEXP_REPLACE(title, \'[^a-zA-Z0-9]+\', \'-\', \'g\')) WHERE slug IS NULL');
        }

        // Make slug not nullable after generating slugs
        Schema::table('books', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
