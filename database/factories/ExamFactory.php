<?php

namespace Database\Factories;

use App\Models\Exam;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition(): array
    {
        $vakken = [
            'Wiskunde' => ['Basis wiskunde', 'Algebra en vergelijkingen', 'Meetkunde', 'Statistiek en kansrekening'],
            'Natuurkunde' => ['Elektriciteit en magnetisme', 'Mechanica', 'Optica en golven', 'Energie en warmte'],
            'Nederlands' => ['Taal en grammatica', 'Spelling en interpunctie', 'Begrijpend lezen', 'Schrijven en argumentatie'],
            'Engels' => ['Engelse grammatica', 'Vocabulaire en idiomen', 'Leesvaardigheid', 'Schrijfvaardigheid'],
            'Scheikunde' => ['Periodiek systeem', 'Chemische bindingen', 'Reacties en vergelijkingen', 'Organische chemie'],
            'Biologie' => ['Het menselijk lichaam', 'Celbiologie', 'Ecologie', 'Genetica'],
            'Geschiedenis' => ['Tweede Wereldoorlog', 'Gouden Eeuw', 'Romeinse Rijk', 'Franse Revolutie'],
            'Aardrijkskunde' => ['Klimaat en weer', 'Landschappen', 'Bevolking en migratie', 'Duurzaamheid'],
        ];

        $vak = fake()->randomElement(array_keys($vakken));
        $beschrijving = fake()->randomElement($vakken[$vak]);

        $toetsTypes = ['Toets', 'Proefwerk', 'Examen', 'Tentamen', 'Module', 'Hertentamen'];
        $type = fake()->randomElement($toetsTypes);

        return [
            'name' => "{$vak} {$type}",
            'description' => $beschrijving,
            'active_from' => fake()->dateTimeBetween('-30 days', 'now'),
            'active_until' => fake()->dateTimeBetween('now', '+90 days'),
            'globally_available' => fake()->boolean(30),
            'max_mistakes' => fake()->numberBetween(3, 10),
        ];
    }

    public function globallyAvailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'globally_available' => true,
        ]);
    }

    public function locallyAvailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'globally_available' => false,
        ]);
    }

    public function withMaxMistakes(int $aantal): static
    {
        return $this->state(fn (array $attributes) => [
            'max_mistakes' => $aantal,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'active_from' => now()->subDays(7),
            'active_until' => now()->addDays(30),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'active_from' => now()->subDays(60),
            'active_until' => now()->subDays(1),
        ]);
    }
}
