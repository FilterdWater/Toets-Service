<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnswerSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        Question::whereIn('type', ['single_choice', 'multiple_choice'])
            ->select(['id', 'type'])
            ->chunkById(100, function ($questions) use ($now) {
                $inserts = [];

                foreach ($questions as $question) {
                    $inserts = array_merge(
                        $inserts,
                        $this->createAnswersForQuestion($question, $now)
                    );
                }

                DB::table('answers')->insert($inserts);
            });
    }

    private function createAnswersForQuestion(Question $question, $now): array
    {
        $correctCount = $question->type === 'single_choice' ? 1 : rand(1, 3);

        $options = [
            ['Antwoord A', 'Optie 1', 'Keuze A', 'Mogelijkheid 1'],
            ['Antwoord B', 'Optie 2', 'Keuze B', 'Mogelijkheid 2'],
            ['Antwoord C', 'Optie 3', 'Keuze C', 'Mogelijkheid 3'],
            ['Antwoord D', 'Optie 4', 'Keuze D', 'Mogelijkheid 4'],
        ];

        $correctIndices = array_rand($options, $correctCount);
        if (! is_array($correctIndices)) {
            $correctIndices = [$correctIndices];
        }

        $inserts = [];

        foreach ($options as $index => $textOptions) {
            $inserts[] = [
                'answer_option' => $textOptions[array_rand($textOptions)],
                'is_correct' => in_array($index, $correctIndices),
                'question_id' => $question->id,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        return $inserts;
    }
}
