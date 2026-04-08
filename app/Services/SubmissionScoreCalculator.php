<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Submission;
use App\Models\UserAnswer;
use Illuminate\Support\Collection;

final class SubmissionScoreCalculator
{
    /**
     * @return array{total_questions: int, correct_answers: int, score: float}
     */
    public static function calculate(Submission $submission, ?Exam $exam = null): array
    {
        $exam ??= $submission->exam()
            ->with([
                'sections.questions.answers',
            ])
            ->firstOrFail();

        $exam->loadMissing([
            'sections.questions.answers',
        ]);

        $userAnswersByQuestion = $submission->relationLoaded('userAnswers')
            ? $submission->userAnswers->groupBy('question_id')
            : $submission->userAnswers()->get()->groupBy('question_id');

        $totalQuestions = 0;
        $correctAnswers = 0;

        foreach ($exam->sections as $section) {
            foreach ($section->questions as $question) {
                $rows = $userAnswersByQuestion->get($question->id, collect());
                $totalQuestions++;

                if ($question->type === 'text') {
                    continue;
                }

                $correctIds = $question->answers->where('is_correct', true)->pluck('id')->sort()->values()->all();
                $selectedIds = self::selectedAnswerIdsFromUserAnswerRows($rows);

                if ($correctIds === $selectedIds) {
                    $correctAnswers++;
                }
            }
        }

        $score = $totalQuestions > 0
            ? round(($correctAnswers / $totalQuestions) * 10, 1)
            : 0.0;

        return [
            'total_questions' => $totalQuestions,
            'correct_answers' => $correctAnswers,
            'score' => $score,
        ];
    }

    /**
     * @param  Collection<int, UserAnswer>  $rows
     * @return list<int>
     */
    public static function selectedAnswerIdsFromUserAnswerRows(Collection $rows): array
    {
        return $rows->map(function (UserAnswer $userAnswer) {
            $raw = $userAnswer->getRawOriginal('selected_answer');

            return is_numeric($raw) ? (int) $raw : null;
        })->filter()->unique()->sort()->values()->all();
    }

    /**
     * @param  Collection<int, UserAnswer>  $rows
     */
    public static function isQuestionAnswerCorrect(Question $question, Collection $rows): ?bool
    {
        if ($question->type === 'text') {
            return null;
        }

        $correctIds = $question->answers->where('is_correct', true)->pluck('id')->sort()->values()->all();
        $selectedIds = self::selectedAnswerIdsFromUserAnswerRows($rows);

        return $correctIds === $selectedIds;
    }
}
