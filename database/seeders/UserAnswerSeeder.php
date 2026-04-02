<?php

namespace Database\Seeders;

use App\Models\Submission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserAnswerSeeder extends Seeder
{
    public function run(): void
    {
        Submission::whereNotNull('submitted_at')
            ->with('exam.sections.questions.answers')
            ->lazy(50)
            ->each(function (Submission $submission) {
                $this->createAnswersForSubmission($submission);
            });
    }

    private function createAnswersForSubmission(Submission $submission): void
    {
        $questions = $submission->exam->sections->flatMap->questions;
        $now = now();
        $inserts = [];

        foreach ($questions as $question) {
            $inserts[] = $this->createInsertData($submission, $question, $now);
        }

        if (! empty($inserts)) {
            DB::table('user_answers')->insert($inserts);
        }
    }

    private function createInsertData(Submission $submission, $question, $now): array
    {
        if ($question->type === 'text') {
            return [
                'submission_id' => $submission->id,
                'question_id' => $question->id,
                'selected_answer' => null,
                'text_answer' => $this->randomTextAnswer(),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $answers = $question->answers;

        if ($answers->isEmpty()) {
            return [
                'submission_id' => $submission->id,
                'question_id' => $question->id,
                'selected_answer' => null,
                'text_answer' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($question->type === 'single_choice') {
            $selectedAnswer = $answers->random();
        } else {
            $correctAnswers = $answers->filter(fn ($a) => $a->is_correct);
            $incorrectAnswers = $answers->filter(fn ($a) => ! $a->is_correct);

            if ($correctAnswers->isNotEmpty() && rand(0, 1)) {
                $selectedAnswer = $correctAnswers->random();
            } else {
                $selectedAnswer = $incorrectAnswers->isNotEmpty()
                    ? $incorrectAnswers->random()
                    : $answers->random();
            }
        }

        return [
            'submission_id' => $submission->id,
            'question_id' => $question->id,
            'selected_answer' => $selectedAnswer->id,
            'text_answer' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    private function randomTextAnswer(): string
    {
        $answers = [
            'Fotosynthese is het proces waarbij planten zonlicht omzetten in energie.',
            'Celdeling is het proces waarbij een cel zich splitst in twee identieke cellen.',
            'Een atoom is een enkel deeltje, een molecuul is een combinatie van atomen.',
            'De lucht lijkt blauw door Rayleigh-verstrooiing van zonlicht.',
            'De hartslag wordt veroorzaakt door de sinusknoop die elektrische signalen afgeeft.',
            'DNA bevat de genetische informatie van een organisme.',
            'Metalen geleiden warmte en elektriciteit goed.',
        ];

        return $answers[array_rand($answers)];
    }
}
