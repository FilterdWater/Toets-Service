<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Exam;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class SubmissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->createSubmissionsForStudents();

        $this->createCompletedSubmissions();
        $this->ensureCompletedSamplesForEveryExam();
    }

    private function createSubmissionsForStudents(): void
    {
        $students = User::where('role', Role::Student)
            ->with('groups:id')
            ->get();

        foreach ($students as $student) {
            $eligibleExams = $this->eligibleExamsForStudent($student);
            if ($eligibleExams->isEmpty()) {
                continue;
            }

            $submissionCount = rand(2, 5);
            $randomExams = $eligibleExams->random(min($submissionCount, $eligibleExams->count()));

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
        $students = User::where('role', Role::Student)
            ->with('groups:id')
            ->get();

        for ($i = 0; $i < 20; $i++) {
            $student = $students->random();
            $eligibleExams = $this->eligibleExamsForStudent($student);
            if ($eligibleExams->isEmpty()) {
                continue;
            }

            $exam = $eligibleExams->random();
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

    private function ensureCompletedSamplesForEveryExam(): void
    {
        $exams = Exam::with(['groups.users', 'users'])->get();

        foreach ($exams as $exam) {
            $existingCompletedCount = Submission::where('exam_id', $exam->id)
                ->whereNotNull('submitted_at')
                ->count();

            if ($existingCompletedCount >= 2) {
                continue;
            }

            $missingCount = 2 - $existingCompletedCount;
            $eligibleStudents = $this->eligibleStudentsForExam($exam);

            if ($eligibleStudents->isEmpty()) {
                continue;
            }

            for ($i = 0; $i < $missingCount; $i++) {
                $student = $eligibleStudents->random();
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

    /**
     * @return Collection<int, User>
     */
    private function eligibleStudentsForExam(Exam $exam): Collection
    {
        if ($exam->globally_available) {
            return User::where('role', Role::Student)->get();
        }

        $groupStudentIds = $exam->groups
            ->flatMap(fn ($group) => $group->users)
            ->where('role', Role::Student)
            ->pluck('id');

        $directStudentIds = $exam->users
            ->where('role', Role::Student)
            ->pluck('id');

        $studentIds = $groupStudentIds
            ->merge($directStudentIds)
            ->unique()
            ->values();

        if ($studentIds->isEmpty()) {
            return collect();
        }

        return User::where('role', Role::Student)
            ->whereIn('id', $studentIds)
            ->get();
    }

    /**
     * @return Collection<int, Exam>
     */
    private function eligibleExamsForStudent(User $student): Collection
    {
        $studentGroupIds = $student->groups->pluck('id');

        return Exam::query()
            ->with(['groups:id', 'users:id,role'])
            ->where(function ($query) use ($student, $studentGroupIds) {
                $query->where('globally_available', true)
                    ->orWhereHas('groups', function ($q) use ($studentGroupIds) {
                        $q->whereIn('groups.id', $studentGroupIds);
                    })
                    ->orWhereHas('users', function ($q) use ($student) {
                        $q->where('users.id', $student->id);
                    });
            })
            ->get();
    }
}
