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
            Schema::create('comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('book_id')->constrained('books')->onDelete('cascade');

                // Nested comment
                $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');

                $table->text('content');
                $table->integer('depth')->default(0);

                $table->json('mentions')->nullable(); // ["user_id1","user_id2"]
                $table->json('sections')->nullable(); // ["section_id1","section_id2"] @section için
                $table->json('pages')->nullable(); // ["page_id1","page_id2"] @page için
                $table->json('authors')->nullable(); // ["author_id1","author_id2"] @author için

                $table->timestamps();
            });

        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('comments');
        }
    };
