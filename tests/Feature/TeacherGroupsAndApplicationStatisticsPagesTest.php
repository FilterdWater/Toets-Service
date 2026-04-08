<?php

use App\Enums\Role;
use App\Models\User;

test('teacher dashboard renders correct inertia component', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $this->actingAs($teacher);

    $response = $this->get(route('groups'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/groups/groups')
    );
});

test('teacher groups page renders correct inertia component', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $this->actingAs($teacher);

    $response = $this->get(route('groups'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/groups/groups')
    );
});

test('admin application statistics page renders correct inertia component', function (): void {
    $admin = User::factory()->create([
        'role' => Role::Beheerder,
    ]);

    $this->actingAs($admin);

    $response = $this->get(route('applicationStatistics'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/application-statistics')
    );
});
