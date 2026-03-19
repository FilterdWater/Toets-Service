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
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->dateTime('active_from');
            $table->dateTime('active_until');
            $table->boolean('globally_available')->default(false);
            $table->integer('max_mistakes')->unsigned();
            $table->timestamps();
        });

        Schema::create('groups_has_exams', function (Blueprint $table) {
            $table->foreignId('group_id')->constrained('groups')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
        });

        Schema::create('user_has_exams', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exams');
        Schema::dropIfExists('groups_has_exams');
        Schema::dropIfExists('user_has_exams');
    }
};
