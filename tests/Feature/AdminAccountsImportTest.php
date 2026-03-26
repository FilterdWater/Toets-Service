<?php

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;

test('admin can import users from CSV', function (): void {
    $admin = User::factory()->create([
        'role' => Role::Beheerder,
    ]);

    $this->actingAs($admin);

    $csv = <<<'CSV'
name,email,password,role
Alice,alice@example.com,Password123!,student
Bob,bob@example.com,Password123!,teacher
CSV;

    $file = UploadedFile::fake()->createWithContent(
        'users.csv',
        $csv,
    );

    $response = $this->post(route('accountImport'), [
        'csv' => $file,
    ]);

    $response->assertRedirect(route('accounts'));

    $this->assertDatabaseHas('users', [
        'email' => 'alice@example.com',
        'role' => 'student',
    ]);

    $this->assertDatabaseHas('users', [
        'email' => 'bob@example.com',
        'role' => 'teacher',
    ]);
});

test('admin import fails when CSV is invalid', function (): void {
    $admin = User::factory()->create([
        'role' => Role::Beheerder,
    ]);

    $this->actingAs($admin);

    $csv = <<<'CSV'
name,email,password,role
Al,bad-email,Password123!,student
CSV;

    $file = UploadedFile::fake()->createWithContent(
        'users.csv',
        $csv,
    );

    $response = $this->from(route('accounts'))->post(route('accountImport'), [
        'csv' => $file,
    ]);

    $response->assertRedirect(route('accounts'));
    $response->assertSessionHasErrors('csv');
});
