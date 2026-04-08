<?php

use App\Models\Exam;
use App\Models\Submission;
use App\Models\User;

test('student sees finished globally available exam without group or direct exam attachment', function (): void {
    $student = User::factory()->create();
    $exam = Exam::factory()->active()->globallyAvailable()->create();

    Submission::factory()
        ->forUser($student)
        ->forExam($exam)
        ->completed()
        ->create(['outdated' => false]);

    $this->actingAs($student)
        ->get(route('student'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('student/student')
            ->has('finishedExams', 1)
            ->where('finishedExams.0.id', $exam->id)
        );
});

test('student available exams are ordered by end date', function (): void {
    $student = User::factory()->create();

    $laterEndingExam = Exam::factory()->globallyAvailable()->create([
        'active_from' => now()->subDay(),
        'active_until' => now()->addDays(5),
    ]);

    $soonerEndingExam = Exam::factory()->globallyAvailable()->create([
        'active_from' => now()->subDay(),
        'active_until' => now()->addDay(),
    ]);

    $this->actingAs($student)
        ->get(route('student'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('student/student')
            ->has('availableExams', 2)
            ->where('availableExams.0.id', $soonerEndingExam->id)
            ->where('availableExams.1.id', $laterEndingExam->id)
        );
});

test('student finished exams are ordered by latest submission', function (): void {
    $student = User::factory()->create();

    $olderExam = Exam::factory()->active()->globallyAvailable()->create();
    $newerExam = Exam::factory()->active()->globallyAvailable()->create();

    Submission::factory()
        ->forUser($student)
        ->forExam($olderExam)
        ->create([
            'outdated' => false,
            'started_at' => now()->subDays(3),
            'submitted_at' => now()->subDays(2),
        ]);

    Submission::factory()
        ->forUser($student)
        ->forExam($newerExam)
        ->create([
            'outdated' => false,
            'started_at' => now()->subDays(2),
            'submitted_at' => now()->subDay(),
        ]);

    $this->actingAs($student)
        ->get(route('student'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('student/student')
            ->has('finishedExams', 2)
            ->where('finishedExams.0.id', $newerExam->id)
            ->where('finishedExams.1.id', $olderExam->id)
        );
});
