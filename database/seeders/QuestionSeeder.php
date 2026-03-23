<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $typeWeights = [
            'single_choice' => 60,
            'multiple_choice' => 30,
            'text' => 10,
        ];

        $sections = DB::table('sections')->get();

        foreach ($sections as $section) {
            $questionCount = rand(5, 8);

            for ($i = 1; $i <= $questionCount; $i++) {
                $type = $this->getWeightedRandomType($typeWeights);
                $title = "Vraag {$i}";
                $text = $this->generateQuestionText($type);

                DB::table('questions')->insert([
                    'title' => $title,
                    'text' => $text,
                    'type' => $type,
                    'sequence_nr' => $i,
                    'section_id' => $section->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function getWeightedRandomType(array $weights): string
    {
        $random = rand(1, 100);
        $cumulative = 0;

        foreach ($weights as $type => $weight) {
            $cumulative += $weight;
            if ($random <= $cumulative) {
                return $type;
            }
        }

        return 'single_choice';
    }

    private function generateQuestionText(string $type): string
    {
        $texts = [
            'single_choice' => [
                'Wat is de uitkomst van 5 + 3?',
                'Welke kleur krijg je bij het mengen van blauw en geel?',
                'Wat is de hoofdstad van Nederland?',
                'Hoeveel planeten telt ons zonnestelsel?',
                'Wat is de grootste oceaan ter wereld?',
                'Welk metaal is vloeibaar bij kamertemperatuur?',
            ],
            'multiple_choice' => [
                'Welke van de volgende zijn zoogdieren?',
                'Selecteer alle landen die in Europa liggen.',
                'Wat zijn kenmerken van een plantaardige cel?',
                'Welke stoffen zijn metalen?',
                'Noem alle planeten in ons zonnestelsel.',
            ],
            'text' => [
                'Leg uit wat fotosynthese inhoudt.',
                'Beschrijf in eigen woorden het proces van celdeling.',
                'Wat is het verschil tussen een atoom en een molecuul?',
                'Verklaar waarom de lucht blauw lijkt.',
            ],
        ];

        return collect($texts[$type])->random();
    }
}
