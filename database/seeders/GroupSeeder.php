<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        $groupNames = [
            'Klas 1A',
            'Klas 1B',
            'Klas 2A',
            'Klas 2B',
            'Klas 3A',
            'Examen Groep 4',
            'Examen Groep 5',
        ];

        foreach ($groupNames as $name) {
            $groupId = DB::table('groups')->insertGetId([
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $student = DB::table('users')->where('role', 'student')->first();
        if ($student) {
            $groups = DB::table('groups')->pluck('id')->toArray();
            foreach (array_slice($groups, 0, 3) as $groupId) {
                DB::table('groups_has_users')->insert([
                    'group_id' => $groupId,
                    'user_id' => $student->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
