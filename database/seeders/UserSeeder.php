<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->createDefaultUsers();

        $this->createTeachers(5);

        $this->createStudents(50);
    }

    private function createDefaultUsers(): void
    {
        User::factory()->create([
            'name' => 'User',
            'email' => 'email@roc.nl',
            'password' => Hash::make('password'),
            'role' => Role::Beheerder,
        ]);

        User::factory()->beheerder()->create([
            'name' => 'Beheerder Rob',
            'email' => 'beheerder@roca12.nl',
            'password' => Hash::make('password'),
        ]);

        User::factory()->docent()->create([
            'name' => 'Docent Jan',
            'email' => 'docent@roca12.nl',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Student Frenkie',
            'email' => 'student@st.roc.a12.nl',
            'password' => Hash::make('password'),
            'role' => Role::Student,
        ]);
    }

    private function createTeachers(int $count): void
    {
        User::factory()->docent()->count($count)->create();
    }

    private function createStudents(int $count): void
    {
        User::factory()->count($count)->create();
    }
}
