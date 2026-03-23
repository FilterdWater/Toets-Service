<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            GroupSeeder::class,
            ExamSeeder::class,
            SectionSeeder::class,
            QuestionSeeder::class,
            AnswerSeeder::class,
            SubmissionSeeder::class,
            UserAnswerSeeder::class,
        ]);
    }
}
