<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'User',
                'email' => 'email@roc.nl',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'Beheerder Rob',
                'email' => 'beheerder@roca12.nl',
                'password' => Hash::make('B3he3rd3r@r0ca!2'),
                'role' => 'admin',
            ],
            [
                'name' => 'Docent Jan',
                'email' => 'docent@roca12.nl',
                'password' => Hash::make('D0c3nt@r0ca!2'),
                'role' => 'teacher',
            ],
            [
                'name' => 'Student Frenkie',
                'email' => 'student@st.roc.a12.nl',
                'password' => Hash::make('Stud3nt@r0ca!'),
                'role' => 'student',
            ],
        ]);
    }
}
