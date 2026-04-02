<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Exam;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;

class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->createSubmissionsForStudents();

        $this->createCompletedSubmissions();
    }

    private function createSubmissionsForStudents(): void
    {
        $students = User::where('role', Role::Student)->get();
        $exams = Exam::all();

        foreach ($students as $student) {
            $submissionCount = rand(2, 5);
            $randomExams = $exams->random(min($submissionCount, $exams->count()));

            foreach ($randomExams as $exam) {
                $startedAt = now()->subDays(rand(1, 60));

                Submission::factory()
                    ->forUser($student)
                    ->forExam($exam)
                    ->create([
                        'started_at' => $startedAt,
                    ]);
            }
        }
    }

    private function createCompletedSubmissions(): void
    {
        $students = User::where('role', Role::Student)->get();
        $exams = Exam::all();

        for ($i = 0; $i < 20; $i++) {
            $student = $students->random();
            $exam = $exams->random();
            $startedAt = now()->subDays(rand(1, 60));

            Submission::factory()
                ->forUser($student)
                ->forExam($exam)
                ->completed()
                ->create([
                    'started_at' => $startedAt,
                ]);
        }
    }
}
