<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $exams = Exam::with('sections')->get();

        foreach ($exams as $exam) {
            $this->createSectionsForExam($exam);
        }
    }

    private function createSectionsForExam($exam): void
    {
        $sectionCount = rand(3, 6);

        Section::factory()->inleiding()->create([
            'exam_id' => $exam->id,
            'sequence_nr' => 1,
        ]);

        $sequenceNr = 2;

        for ($i = 0; $i < $sectionCount - 2; $i++) {
            Section::factory()->hoofdstuk((string) ($i + 1))->create([
                'exam_id' => $exam->id,
                'sequence_nr' => $sequenceNr++,
            ]);
        }

        Section::factory()->eindopdracht()->create([
            'exam_id' => $exam->id,
            'sequence_nr' => $sequenceNr,
        ]);
    }
}
