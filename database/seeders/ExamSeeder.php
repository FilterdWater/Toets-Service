<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $examTemplates = [
            ['name' => 'Wiskunde Toets', 'description' => 'Basis wiskunde voor klas 1 en 2'],
            ['name' => 'Natuurkunde Examen', 'description' => 'Elektriciteit en mechanica'],
            ['name' => 'Nederlands Centraal Examen', 'description' => 'Taal en grammatica'],
            ['name' => 'Engels Module 1', 'description' => 'Engelse grammatica en vocabulaire'],
            ['name' => 'Scheikunde Proefwerk', 'description' => 'Periodiek systeem en chemische bindingen'],
            ['name' => 'Biologie Hoofdstuk 5', 'description' => 'Het menselijk lichaam'],
            ['name' => 'Geschiedenis Tentamen', 'description' => 'Tweede Wereldoorlog'],
            ['name' => 'Aardrijkskunde Toets', 'description' => 'Klimaat en weersystemen'],
        ];

        $groups = DB::table('groups')->pluck('id')->toArray();
        $students = DB::table('users')->where('role', 'student')->pluck('id')->toArray();
        $teachers = DB::table('users')->where('role', 'teacher')->pluck('id')->toArray();

        foreach ($groups as $groupId) {
            $selectedExams = collect($examTemplates)->random(4);

            foreach ($selectedExams as $template) {
                $examId = DB::table('exams')->insertGetId([
                    'name' => $template['name'],
                    'description' => $template['description'],
                    'active_from' => now()->subDays(rand(1, 30)),
                    'active_until' => now()->addDays(rand(30, 90)),
                    'globally_available' => rand(0, 1),
                    'max_mistakes' => rand(3, 10),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('groups_has_exams')->insert([
                    'group_id' => $groupId,
                    'exam_id' => $examId,
                ]);

                if (! empty($students)) {
                    $randomStudent = $students[array_rand($students)];
                    DB::table('user_has_exams')->insert([
                        'user_id' => $randomStudent,
                        'exam_id' => $examId,
                    ]);
                }
            }
        }
    }
}
