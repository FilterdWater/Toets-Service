<?php

use App\Enums\Role;
use App\Models\Exam;
use App\Models\Submission;
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
        ->component('teacher/exam/exams')
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
        ->component('teacher/exam/exam')
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
        ->component('teacher/exam/exam')
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
        ->component('teacher/exam/exam-result')
        ->has('exam')
        ->has('results')
        ->has('summary')
    );
});

test('exam results page includes completed submissions for csv source data', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);
    $student = User::factory()->create([
        'role' => Role::Student,
    ]);
    $exam = Exam::factory()->create();

    Submission::factory()
        ->forExam($exam)
        ->forUser($student)
        ->completed()
        ->current()
        ->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examResults', $exam));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/exam/exam-result')
        ->has('results', 1)
        ->where('results.0.user.email', $student->email)
        ->has('results.0.score')
        ->has('results.0.correct_answers')
        ->has('results.0.total_questions')
    );
});

test('exam results page keeps only latest submission per student', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);
    $student = User::factory()->create([
        'role' => Role::Student,
    ]);
    $exam = Exam::factory()->create();

    Submission::factory()
        ->forExam($exam)
        ->forUser($student)
        ->completed()
        ->create([
            'started_at' => now()->subMinutes(20),
            'submitted_at' => now()->subMinutes(19),
        ]);

    Submission::factory()
        ->forExam($exam)
        ->forUser($student)
        ->completed()
        ->create([
            'started_at' => now()->subMinutes(5),
            'submitted_at' => now()->subMinutes(4),
        ]);

    $this->actingAs($teacher);

    $response = $this->get(route('examResults', $exam));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('teacher/exam/exam-result')
        ->has('results', 1)
        ->where('results.0.user.id', $student->id)
    );
});

test('exams index returns sort and direction in props', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->count(3)->create();

    $this->actingAs($teacher);

    $response = $this->get(route('exams'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('sortBy', 'created_at')
        ->where('direction', 'desc')
    );
});

test('exams index can sort by name ascending', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->create(['name' => 'Charlie Exam']);
    Exam::factory()->create(['name' => 'Alpha Exam']);
    Exam::factory()->create(['name' => 'Beta Exam']);

    $this->actingAs($teacher);

    $response = $this->get(route('exams', ['sort' => 'name', 'direction' => 'asc']));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('sortBy', 'name')
        ->where('direction', 'asc')
        ->has('exams.data', 3)
        ->where('exams.data.0.name', 'Alpha Exam')
        ->where('exams.data.1.name', 'Beta Exam')
        ->where('exams.data.2.name', 'Charlie Exam')
    );
});

test('exams index can sort by name descending', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->create(['name' => 'Charlie Exam']);
    Exam::factory()->create(['name' => 'Alpha Exam']);
    Exam::factory()->create(['name' => 'Beta Exam']);

    $this->actingAs($teacher);

    $response = $this->get(route('exams', ['sort' => 'name', 'direction' => 'desc']));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('sortBy', 'name')
        ->where('direction', 'desc')
        ->where('exams.data.0.name', 'Charlie Exam')
        ->where('exams.data.1.name', 'Beta Exam')
        ->where('exams.data.2.name', 'Alpha Exam')
    );
});

test('exams index defaults to created_at desc for invalid sort column', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->count(3)->create();

    $this->actingAs($teacher);

    $response = $this->get(route('exams', ['sort' => 'invalid_column', 'direction' => 'asc']));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('sortBy', 'created_at')
        ->where('direction', 'asc')
    );
});

test('exams index defaults to desc for invalid direction', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    Exam::factory()->count(3)->create();

    $this->actingAs($teacher);

    $response = $this->get(route('exams', ['sort' => 'name', 'direction' => 'invalid']));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->where('sortBy', 'name')
        ->where('direction', 'desc')
    );
});
