<?php

namespace Database\Factories;

use App\Models\Answer;
use App\Models\Question;
use App\Models\Submission;
use App\Models\UserAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserAnswerFactory extends Factory
{
    protected $model = UserAnswer::class;

    public function definition(): array
    {
        return [
            'selected_answer' => null,
            'text_answer' => null,
        ];
    }

    public function forSubmission(Submission $submission): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_id' => $submission->id,
        ]);
    }

    public function forQuestion(Question $question): static
    {
        return $this->state(fn (array $attributes) => [
            'question_id' => $question->id,
        ]);
    }

    public function withSelectedAnswer(Answer $answer): static
    {
        return $this->state(fn (array $attributes) => [
            'selected_answer' => $answer->id,
            'text_answer' => null,
        ]);
    }

    public function withTextAnswer(string $antwoord): static
    {
        return $this->state(fn (array $attributes) => [
            'selected_answer' => null,
            'text_answer' => $antwoord,
        ]);
    }

    public function withCorrectAnswer(): static
    {
        return $this->state(fn (array $attributes) => [
            'selected_answer' => Answer::factory()->correct(),
        ]);
    }

    public function withIncorrectAnswer(): static
    {
        return $this->state(fn (array $attributes) => [
            'selected_answer' => Answer::factory()->incorrect(),
        ]);
    }
}
