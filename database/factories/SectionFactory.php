<?php

namespace Database\Factories;

use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

class SectionFactory extends Factory
{
    protected $model = Section::class;

    public function definition(): array
    {
        $sectieNamen = [
            'Inleiding',
            'Hoofdstuk 1',
            'Hoofdstuk 2',
            'Hoofdstuk 3',
            'Deel A',
            'Deel B',
            'Deel C',
            'Basisvragen',
            'Verdiepingsvragen',
            'Eindopdracht',
            'Samenvatting',
            'Oefentoets',
            'Praktijkopdracht',
            'Theorie',
        ];

        return [
            'name' => fake()->randomElement($sectieNamen),
            'new_page' => fake()->boolean(40),
            'sequence_nr' => 1,
        ];
    }

    public function newPage(): static
    {
        return $this->state(fn (array $attributes) => [
            'new_page' => true,
        ]);
    }

    public function continuation(): static
    {
        return $this->state(fn (array $attributes) => [
            'new_page' => false,
        ]);
    }

    public function inleiding(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Inleiding',
            'new_page' => true,
        ]);
    }

    public function hoofdstuk(string $nummer = '1'): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => "Hoofdstuk {$nummer}",
            'new_page' => true,
        ]);
    }

    public function eindopdracht(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Eindopdracht',
            'new_page' => true,
        ]);
    }
}
