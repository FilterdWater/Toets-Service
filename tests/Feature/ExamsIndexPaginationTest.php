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
