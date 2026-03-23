<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnswerSeeder extends Seeder
{
    public function run(): void
    {
        $questions = DB::table('questions')->get();

        $answerOptions = [
            'A' => ['Antwoord A', 'Optie 1', 'Keuze A', 'Mogelijkheid 1'],
            'B' => ['Antwoord B', 'Optie 2', 'Keuze B', 'Mogelijkheid 2'],
            'C' => ['Antwoord C', 'Optie 3', 'Keuze C', 'Mogelijkheid 3'],
            'D' => ['Antwoord D', 'Optie 4', 'Keuze D', 'Mogelijkheid 4'],
        ];

        foreach ($questions as $question) {
            if ($question->type === 'text') {
                continue;
            }

            $correctCount = $question->type === 'single_choice' ? 1 : rand(1, 3);
            $correctIndices = collect(range(0, 3))->random($correctCount)->toArray();

            for ($i = 0; $i < 4; $i++) {
                $isCorrect = in_array($i, $correctIndices);
                $optionKey = array_keys($answerOptions)[$i];
                $answerText = collect($answerOptions[$optionKey])->random();

                DB::table('answers')->insert([
                    'answer_option' => $answerText,
                    'is_correct' => $isCorrect,
                    'question_id' => $question->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
