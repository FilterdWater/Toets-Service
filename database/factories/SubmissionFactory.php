<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        $gestartOp = fake()->dateTimeBetween('-60 days', 'now');
        $isIngediend = fake()->boolean(70);

        return [
            'started_at' => $gestartOp,
            'submitted_at' => $isIngediend ? fake()->dateTimeBetween($gestartOp, 'now') : null,
            'outdated' => fake()->boolean(20),
        ];
    }

    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $gestartOp = $attributes['started_at'];

            return [
                'submitted_at' => fake()->dateTimeBetween($gestartOp, 'now'),
            ];
        });
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'submitted_at' => null,
        ]);
    }

    public function outdated(): static
    {
        return $this->state(fn (array $attributes) => [
            'outdated' => true,
        ]);
    }

    public function current(): static
    {
        return $this->state(fn (array $attributes) => [
            'outdated' => false,
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    public function forExam(Exam $exam): static
    {
        return $this->state(fn (array $attributes) => [
            'exam_id' => $exam->id,
        ]);
    }
}
