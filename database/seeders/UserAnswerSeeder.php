<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\Submission;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserAnswerSeeder extends Seeder
{
    /**
     * Percentage: The chance of attempting to answer correctly for multiple-choice (single/multi) questions. The remainder will deliberately answer incorrectly to ensure some failing samples.
     */
    private const CORRECT_ATTEMPT_CHANCE_PERCENT = 55;

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
            foreach ($this->createInsertRows($submission, $question, $now) as $row) {
                $inserts[] = $row;
            }
        }

        if (! empty($inserts)) {
            DB::table('user_answers')->insert($inserts);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function createInsertRows(Submission $submission, $question, $now): array
    {
        if ($question->type === 'text') {
            return [[
                'submission_id' => $submission->id,
                'question_id' => $question->id,
                'selected_answer' => null,
                'text_answer' => $this->randomTextAnswer(),
                'created_at' => $now,
                'updated_at' => $now,
            ]];
        }

        $answers = $question->answers;

        if ($answers->isEmpty()) {
            return [[
                'submission_id' => $submission->id,
                'question_id' => $question->id,
                'selected_answer' => null,
                'text_answer' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]];
        }

        if ($question->type === 'single_choice') {
            return [$this->makeChoiceRow(
                $submission,
                $question,
                $this->pickSingleChoiceAnswer($answers),
                $now
            )];
        }

        return $this->createMultipleChoiceRows($submission, $question, $answers, $now);
    }

    /**
     * @param  EloquentCollection<int, Answer>  $answers
     */
    private function pickSingleChoiceAnswer(EloquentCollection $answers): Answer
    {
        $correctAnswers = $answers->filter(fn ($a) => $a->is_correct);
        $incorrectAnswers = $answers->filter(fn ($a) => ! $a->is_correct);

        if ($correctAnswers->isNotEmpty() && random_int(1, 100) <= self::CORRECT_ATTEMPT_CHANCE_PERCENT) {
            return $correctAnswers->random();
        }

        if ($incorrectAnswers->isNotEmpty()) {
            return $incorrectAnswers->random();
        }

        return $answers->random();
    }

    /**
     * @param  EloquentCollection<int, Answer>  $answers
     * @return list<array<string, mixed>>
     */
    private function createMultipleChoiceRows(
        Submission $submission,
        $question,
        EloquentCollection $answers,
        $now
    ): array {
        /** @var EloquentCollection<int, Answer> $correctAnswers */
        $correctAnswers = $answers->filter(fn ($a) => $a->is_correct)->values();
        /** @var EloquentCollection<int, Answer> $incorrectAnswers */
        $incorrectAnswers = $answers->filter(fn ($a) => ! $a->is_correct)->values();

        if ($correctAnswers->isEmpty()) {
            return [$this->makeChoiceRow($submission, $question, $answers->random(), $now)];
        }

        $wantFullCorrect = random_int(1, 100) <= self::CORRECT_ATTEMPT_CHANCE_PERCENT;

        if ($wantFullCorrect) {
            return $correctAnswers->map(fn ($answer) => $this->makeChoiceRow(
                $submission,
                $question,
                $answer,
                $now
            ))->all();
        }

        return $this->makeWrongMultipleChoiceRows(
            $submission,
            $question,
            $correctAnswers,
            $incorrectAnswers,
            $answers,
            $now
        );
    }

    /**
     * @param  EloquentCollection<int, Answer>  $correctAnswers
     * @param  EloquentCollection<int, Answer>  $incorrectAnswers
     * @param  EloquentCollection<int, Answer>  $allAnswers
     * @return list<array<string, mixed>>
     */
    private function makeWrongMultipleChoiceRows(
        Submission $submission,
        $question,
        EloquentCollection $correctAnswers,
        EloquentCollection $incorrectAnswers,
        EloquentCollection $allAnswers,
        $now
    ): array {
        if ($incorrectAnswers->isNotEmpty() && random_int(0, 1) === 1) {
            return [$this->makeChoiceRow($submission, $question, $incorrectAnswers->random(), $now)];
        }

        if ($correctAnswers->count() > 1) {
            $takeCount = random_int(1, $correctAnswers->count() - 1);
            $partial = $correctAnswers->take($takeCount);

            return $partial->map(fn ($answer) => $this->makeChoiceRow(
                $submission,
                $question,
                $answer,
                $now
            ))->all();
        }

        if ($incorrectAnswers->isNotEmpty()) {
            return [$this->makeChoiceRow($submission, $question, $incorrectAnswers->random(), $now)];
        }

        return [$this->makeChoiceRow($submission, $question, $allAnswers->random(), $now)];
    }

    private function makeChoiceRow(
        Submission $submission,
        $question,
        Answer $selectedAnswer,
        $now
    ): array {
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
