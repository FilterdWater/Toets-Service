<?php

use App\Enums\Role;
use App\Models\Exam;
use App\Models\User;

test('exams index returns paginated exams', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->count(15)->create();

    $this->actingAs($teacher);

    $response = $this->get(route('exams'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exams')
        ->has('exams.data', 10)
        ->where('exams.total', 15)
        ->where('exams.last_page', 2)
    );
});

test('exams index can navigate to page 2', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->count(15)->create();

    $this->actingAs($teacher);

    $response = $this->get(route('exams', ['page' => 2]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('exams.current_page', 2)
        ->has('exams.data', 5)
    );
});

test('exam create page renders', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $this->actingAs($teacher);

    $response = $this->get(route('createExam'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
    );
});

test('exam edit page renders', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();

    $this->actingAs($teacher);

    $response = $this->get(route('getExam', $exam->id));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->has('exam')
    );
});

test('exam results page renders', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examResults', $exam));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam-result/exam-result')
        ->has('exam')
    );
});
