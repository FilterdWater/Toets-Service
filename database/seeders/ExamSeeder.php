<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Exam;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $this->createExamsForAllGroups();

        $this->createGlobalExams();
    }

    private function createExamsForAllGroups(): void
    {
        $groups = Group::all();
        $teachers = User::where('role', Role::Docent)->get();

        foreach ($groups as $group) {
            $examCount = rand(3, 5);

            for ($i = 0; $i < $examCount; $i++) {
                $exam = Exam::factory()->create([
                    'active_from' => now()->subDays(rand(1, 30)),
                    'active_until' => now()->addDays(rand(30, 90)),
                ]);

                $exam->groups()->attach($group->id);

                if ($teachers->isNotEmpty()) {
                    $teacher = $teachers->random();
                    $exam->users()->attach($teacher->id);
                }
            }
        }
    }

    private function createGlobalExams(): void
    {
        Exam::factory()
            ->count(5)
            ->globallyAvailable()
            ->create();
    }
}
