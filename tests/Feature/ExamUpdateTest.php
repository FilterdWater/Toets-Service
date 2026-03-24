<?php

use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('exam can be updated', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $exam = Exam::create([
        'name' => 'Old Name',
        'description' => 'Old Description',
        'active_from' => now(),
        'active_until' => now()->addDay(),
        'globally_available' => true,
        'max_mistakes' => 5,
    ]);

    $response = $this->actingAs($user)
        ->put(route('updateexam', $exam), [
            'name' => 'New Name',
            'description' => 'New Description',
            'active_from' => now()->toDateTimeString(),
            'active_until' => now()->addDays(2)->toDateTimeString(),
            'globally_available' => false,
            'max_mistakes' => 10,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('exams', [
        'id' => $exam->id,
        'name' => 'New Name',
        'description' => 'New Description',
        'globally_available' => false,
        'max_mistakes' => 10,
    ]);
});

test('exam update validation fails with invalid data', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);
    $exam = Exam::create([
        'name' => 'Old Name',
        'description' => 'Some description',
        'active_from' => now(),
        'active_until' => now()->addDay(),
        'globally_available' => true,
    ]);

    $response = $this->actingAs($user)
        ->put(route('updateexam', $exam), [
            'name' => '', // Required
            'globally_available' => 'not-a-boolean',
        ]);

    $response->assertSessionHasErrors(['name', 'globally_available']);
});
