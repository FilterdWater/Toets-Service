<?php

namespace Database\Factories;

use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        return [
            'title' => 'Vraag '.fake()->numberBetween(1, 20),
            'text' => fake()->randomElement($this->vraagTeksten()),
            'type' => fake()->randomElement(['single_choice', 'multiple_choice', 'text']),
            'sequence_nr' => 1,
        ];
    }

    public function singleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'single_choice',
        ]);
    }

    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'multiple_choice',
        ]);
    }

    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
        ]);
    }

    public function withText(string $tekst): static
    {
        return $this->state(fn (array $attributes) => [
            'text' => $tekst,
        ]);
    }

    public function sequenceNr(int $nummer): static
    {
        return $this->state(fn (array $attributes) => [
            'sequence_nr' => $nummer,
        ]);
    }

    private function vraagTeksten(): array
    {
        return [
            'Wat is de uitkomst van 5 + 3?',
            'Welke kleur krijg je bij het mengen van blauw en geel?',
            'Wat is de hoofdstad van Nederland?',
            'Hoeveel planeten telt ons zonnestelsel?',
            'Wat is de grootste oceaan ter wereld?',
            'Welk metaal is vloeibaar bij kamertemperatuur?',
            'Wat is de formule voor de omtrek van een cirkel?',
            'Noem drie eigenschappen van metalen.',
            'Wat gebeurt er bij fotosynthese?',
            'Leg uit wat een molecuul is.',
            'Wat is het verschil tussen een atoom en een molecuul?',
            'Beschrijf de werking van de hartslag.',
            'Wat zijn kenmerken van een plantaardige cel?',
            'Welke stoffen zijn metalen?',
            'Noem de fasen van de maan.',
            'Wat is de rol van DNA in de cel?',
            'Beschrijf het proces van verdamping.',
            'Wat is het verschil tussen warmte en temperatuur?',
            'Noem de planeten van ons zonnestelsel op volgorde.',
            'Wat is de betekenis van het woord "democratie"?',
        ];
    }
}
