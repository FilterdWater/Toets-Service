<?php

namespace Database\Factories;

use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

class GroupFactory extends Factory
{
    protected $model = Group::class;

    public function definition(): array
    {
        $klassen = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B'];
        $soorten = ['Klas', 'Examen Groep', 'Groep', 'Team'];

        $soort = fake()->randomElement($soorten);

        if ($soort === 'Klas') {
            $naam = 'Klas '.fake()->randomElement($klassen);
        } elseif ($soort === 'Examen Groep') {
            $naam = 'Examen Groep '.fake()->numberBetween(1, 6);
        } else {
            $naam = $soort.' '.fake()->numberBetween(1, 20);
        }

        return [
            'name' => $naam,
        ];
    }

    public function klas(?string $klas = null): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Klas '.($klas ?? fake()->randomElement(['1A', '1B', '2A', '2B', '3A'])),
        ]);
    }

    public function examenGroep(?int $nummer = null): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Examen Groep '.($nummer ?? fake()->numberBetween(1, 6)),
        ]);
    }
}
