<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Section;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $sections = Section::with('questions')->get();

        foreach ($sections as $section) {
            $this->createQuestionsForSection($section);
        }
    }

    private function createQuestionsForSection(Section $section): void
    {
        $questionCount = rand(5, 10);
        $typeDistribution = $this->getTypeDistribution();

        for ($i = 1; $i <= $questionCount; $i++) {
            $type = $this->chooseType($typeDistribution);

            Question::factory()->create([
                'section_id' => $section->id,
                'sequence_nr' => $i,
                'type' => $type,
            ]);
        }
    }

    private function getTypeDistribution(): array
    {
        return [
            'single_choice' => 60,
            'multiple_choice' => 30,
            'text' => 10,
        ];
    }

    private function chooseType(array $distribution): string
    {
        $random = rand(1, 100);
        $cumulative = 0;

        foreach ($distribution as $type => $percentage) {
            $cumulative += $percentage;
            if ($random <= $cumulative) {
                return $type;
            }
        }

        return 'single_choice';
    }
}
