<?php

namespace Database\Factories;

use App\Models\Answer;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnswerFactory extends Factory
{
    protected $model = Answer::class;

    public function definition(): array
    {
        return [
            'answer_option' => 'Antwoord '.fake()->randomElement(['A', 'B', 'C', 'D']),
            'is_correct' => false,
        ];
    }

    public function correct(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => true,
        ]);
    }

    public function incorrect(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => false,
        ]);
    }

    public function withOption(string $optie): static
    {
        return $this->state(fn (array $attributes) => [
            'answer_option' => $optie,
        ]);
    }
}
