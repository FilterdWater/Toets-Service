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

test('exam create passes back url when referer is a different page', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $fromUrl = route('exams', ['page' => 2]);

    $this->actingAs($teacher);

    $response = $this->withHeader('Referer', $fromUrl)
        ->get(route('createExam'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->where('backUrl', url($fromUrl))
    );
});

test('exam create back url is null when there is no referer (direct load)', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $this->actingAs($teacher);

    $response = $this->get(route('createExam'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->where('backUrl', null)
    );
});

test('exam edit passes back url when referer is a different page', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();
    $fromUrl = route('exams', ['page' => 2]);

    $this->actingAs($teacher);

    $response = $this->withHeader('Referer', $fromUrl)
        ->get(route('getExam', $exam->id));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->where('backUrl', url($fromUrl))
    );
});

test('exam edit back url is null when there is no referer (direct load / refresh)', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();

    $this->actingAs($teacher);

    $response = $this->get(route('getExam', $exam->id));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->where('backUrl', null)
    );
});

test('exam edit back url is null when referer is the same page (refresh)', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();
    $editUrl = route('getExam', $exam->id);

    $this->actingAs($teacher);

    $response = $this->withHeader('Referer', $editUrl)
        ->get($editUrl);

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam/exam')
        ->where('backUrl', null)
    );
});

test('exam results passes back url when referer is a different page', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();
    $fromUrl = route('exams', ['page' => 2]);

    $this->actingAs($teacher);

    $response = $this->withHeader('Referer', $fromUrl)
        ->get(route('examResults', $exam));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam-result/exam-result')
        ->where('backUrl', url($fromUrl))
    );
});

test('exam results back url is null when there is no referer (direct load / refresh)', function (): void {
    $teacher = User::factory()->create([
        'role' => Role::Docent,
    ]);

    $exam = Exam::factory()->create();

    $this->actingAs($teacher);

    $response = $this->get(route('examResults', $exam));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('exam-result/exam-result')
        ->where('backUrl', null)
    );
});
