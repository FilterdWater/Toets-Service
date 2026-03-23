<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $sectionTemplates = [
            ['name' => 'Inleiding', 'new_page' => true],
            ['name' => 'Hoofdstuk 1', 'new_page' => false],
            ['name' => 'Hoofdstuk 2', 'new_page' => false],
            ['name' => 'Deel A', 'new_page' => true],
            ['name' => 'Deel B', 'new_page' => true],
            ['name' => 'Basisvragen', 'new_page' => false],
            ['name' => 'Verdiepingsvragen', 'new_page' => false],
            ['name' => 'Eindopdracht', 'new_page' => true],
        ];

        $exams = DB::table('exams')->pluck('id');

        foreach ($exams as $examId) {
            $selectedSections = collect($sectionTemplates)->random(3);

            foreach ($selectedSections as $index => $section) {
                DB::table('sections')->insert([
                    'name' => $section['name'],
                    'new_page' => $section['new_page'],
                    'sequence_nr' => $index + 1,
                    'exam_id' => $examId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
