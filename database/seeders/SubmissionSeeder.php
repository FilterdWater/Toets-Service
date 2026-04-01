<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $students = DB::table('users')->where('role', 'student')->pluck('id');
        $exams = DB::table('exams')->pluck('id');

        foreach ($students as $studentId) {
            $selectedExams = $exams->random(min(3, $exams->count()));

            foreach ($selectedExams as $examId) {
                $startedAt = now()->subDays(rand(1, 60));
                $isCompleted = rand(0, 1);

                DB::table('submissions')->insert([
                    'user_id' => $studentId,
                    'exam_id' => $examId,
                    'started_at' => $startedAt,
                    'submitted_at' => $isCompleted ? $startedAt->addMinutes(rand(15, 90)) : null,
                    'outdated' => rand(0, 1),
                    'created_at' => $startedAt,
                    'updated_at' => $startedAt,
                ]);
            }
        }
    }
}
