<?php

use App\Enums\Role;
use App\Models\User;

beforeEach(function (): void {
    $this->admin = User::factory()->create([
        'role' => Role::Beheerder,
    ]);

    $this->actingAs($this->admin);
});

test('accounts index returns paginated users', function (): void {
    User::factory()->count(15)->create();

    $response = $this->get(route('accounts'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/accounts')
        ->has('users.data', 10)
        ->where('users.total', 16)
        ->where('users.last_page', 2)
        ->where('selectedRole', 'all')
    );
});

test('accounts index filters by role', function (): void {
    User::factory()->count(5)->create(['role' => Role::Student]);
    User::factory()->count(3)->create(['role' => Role::Docent]);

    $response = $this->get(route('accounts', ['role' => 'student']));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('users.total', 5)
        ->where('selectedRole', 'student')
    );
});

test('accounts index can navigate to page 2', function (): void {
    User::factory()->count(15)->create();

    $response = $this->get(route('accounts', ['page' => 2]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('users.current_page', 2)
        ->has('users.data', 6)
    );
});

test('show edit renders account edit page', function (): void {
    $user = User::factory()->create();

    $response = $this->get(route('accountEdit', $user->id));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/account-edit')
        ->has('user')
    );
});

test('show create renders account create page', function (): void {
    $response = $this->get(route('accountCreate'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/account-create')
    );
});
