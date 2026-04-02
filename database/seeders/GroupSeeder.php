<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        $this->createDefaultGroups();

        $this->createRandomGroups(10);

        $this->attachStudentsToGroups();
    }

    private function createDefaultGroups(): void
    {
        $defaultGroups = [
            'Klas 1A',
            'Klas 1B',
            'Klas 2A',
            'Klas 2B',
            'Klas 3A',
            'Examen Groep 4',
            'Examen Groep 5',
        ];

        foreach ($defaultGroups as $name) {
            Group::factory()->create(['name' => $name]);
        }
    }

    private function createRandomGroups(int $count): void
    {
        Group::factory()->count($count)->create();
    }

    private function attachStudentsToGroups(): void
    {
        $students = User::where('role', Role::Student)->get();
        $groups = Group::all();

        foreach ($students as $student) {
            $randomGroups = $groups->random(rand(1, 4));
            $student->groups()->attach($randomGroups->pluck('id'));
        }
    }
}
